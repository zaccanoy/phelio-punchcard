import AuthorCommitData from './author-commit-data';
import RGBColor from './rgb-color';
import PunchcardOptions from './punchcard-options';
import SVGGridBuilder from './svg-grid-builder/svg-grid-builder';
import Timeframe from './timeframe';

/** The preferred number of columns. It is set to 30 by default. */
const numCols = 30;
/** The maximum number for the recommended mode to be days, which is the
 * number of days in a week multiplied by the preferred number of columns. */
const maxDays = 7 * numCols;
/** The maximum number for the recommended mode to be weeks, which is the
 * approximate number of days in a month multiplied by the preferred number of
 * columns. */
const maxWeeks = 30 * numCols;
/** The maximum number for the recommended mode to be months, which is the
 * approximate number of days in a year multiplied by the preferred number of
 * columns. */
const maxMonths = 365 * numCols;
/** A mapping to convert weekday names to distances from Sunday. */
const weekdayToNum: { [key: string]: number } = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};
/** The number of milliseconds in a day. */
const millisecondsInDay = 86400000;

class PunchcardsBuilder {
  /** The commit data to work with. */
  private commitData: AuthorCommitData;
  /** The earliest date in the data. */
  private earliestDate: Date;
  /** The latest date in the data. */
  private latestDate: Date;
  /** The timeframe for the punchcards. */
  private timeframe: Timeframe;
  /** The color for zero commits. */
  private minColor: RGBColor;
  /** The color for the maximum number of commits. */
  private maxColor: RGBColor;
  /** The number of cells between the earliest date and what would be the
   * top-left corner of the punchcards. */
  private bufferTimeframes: number;
  /** The color data for the punchcard is a two-dimensional array of strings
   * representing the colors at every x- and y-coordinate in each punchcard,
   * seperated by author. */
  private colorData: { [key: string]: string[][] };
  private columnHeaders: string[];
  private grids: { [key: string]: SVGGridBuilder };

  /**
   * Constructs a new Punchcard instance.
   * @param commitSourceData The source data to get the commit information from.
   * The data is expected to be in an array, with each element representing a
   * commit. The given author ID and commit date keys correspond to which keys
   * contain the value for each datum respectively.
   * @param punchcardOptions The options for the Punchcard instance.
   */
  public constructor(
    commitSourceData: [{ [key: string]: string }],
    punchcardOptions: PunchcardOptions,
  ) {
    this.setColors(punchcardOptions.minColor, punchcardOptions.maxColor);
    this.setCommitData(
      commitSourceData,
      punchcardOptions.authorIdKey,
      punchcardOptions.commitDateKey,
      punchcardOptions.timeframe,
    );
  }

  /**
   * Sets the commit data for the punchcards. Afterwards, the timeframe is set.
   * @param commitSourceData The source data for the commits. The data is
   * expected to be in an array, with each element representing a commit. The
   * given author ID and commit date keys correspond to which keys contain the
   * value for each datum respectively.
   * @param authorIdKey The key for the author ID. This is optional and defaults
   * to "author_id".
   * @param commitDateKey The key for the commit date. This is optional and
   * defaults to "commit_date".
   * @param timeframe The timeframe for the punchcards. If not given, the
   * appropriate timeframe is chosen programmatically.
   */
  public setCommitData(
    commitSourceData: { [key: string]: string }[],
    authorIdKey = 'author_id',
    commitDateKey = 'commit_date',
    timeframe?: Timeframe,
  ): void {
    this.commitData = {};

    // Loop through each datum of the source data.
    for (const sourceDatum of commitSourceData) {
      // Find the earliest and latest commit dates for later use.
      const commitDate = new Date(sourceDatum[commitDateKey]);
      if (
        this.earliestDate === undefined ||
        this.earliestDate.getTime() > commitDate.getTime()
      ) {
        this.earliestDate = commitDate;
      } else if (
        this.latestDate === undefined ||
        this.latestDate.getTime() < commitDate.getTime()
      ) {
        this.latestDate = commitDate;
      }

      // Push the commit date to the correct author.
      if (this.commitData[sourceDatum[authorIdKey]] === undefined) {
        this.commitData[sourceDatum[authorIdKey]] = [];
      }
      this.commitData[sourceDatum[authorIdKey]].push(commitDate);
    }

    // Next we need to reset the timeframe since the data changed.
    this.setTimeframe(timeframe);
    this.setBufferTimeframes();
    this.setColorData();
  }

  /**
   * Sets the timeframe for the punchcards. New color data must be generated
   * after this is called to update the SVGs.
   * @param timeframe An optional override for the timeframe. If it is not
   * provided, the function finds the appropriate one programmatically.
   */
  private setTimeframe(timeframe?: Timeframe): void {
    if (timeframe === undefined) {
      // Timeframe is not provided by user, so we choose the appropriate one.
      const numDays =
        (this.latestDate.getTime() - this.earliestDate.getTime()) /
        millisecondsInDay;
      if (numDays <= maxDays) this.timeframe = Timeframe.Days;
      else if (numDays <= maxWeeks) this.timeframe = Timeframe.Weeks;
      else if (numDays <= maxMonths) this.timeframe = Timeframe.Months;
      else this.timeframe = Timeframe.Years;
    } else this.timeframe = timeframe;
  }

  /**
   * Sets the color data for the SVGs. After this is called, the SVGs will be
   * generated again. Changes to the commit data or timeframe will trigger this
   * function to be called.
   */
  private setColorData(): void {
    this.columnHeaders = [];
    let highestNumCommits = 0;
    this.colorData = {};

    for (const authorId of Object.keys(this.commitData)) {
      const initialDate = this.normalizeDate(this.earliestDate);
      // Each element in the array is the number of commits.
      const numberData: { [key: string]: number[][] } = {};
      // The final date is initialized to the next timeframe andalso incremented.
      const finalDate = new Date(initialDate.getTime());
      this.incrementDate(finalDate);
      numberData[authorId] = [];
      // Get the first timeframe index, this will be the first y index in our
      // two-dimensional array of timeframes.
      let y = this.bufferTimeframes;
      // Loop through the current x-coordinate. This should continue until the
      // initial date is greater than the latest date in the data. Every
      // iteration, we increment the x-coordinate.
      for (let x = 0; initialDate.getTime() < this.latestDate.getTime(); x++) {
        // Loop through the current y-coordinate. This should continue until the
        // initial date is greater than the latest date in the data or the
        // y-coordinate is greater than or equal to the number of rows for the
        // current timeframe. Every iteration, we increment the initial date,
        // the final date, and the y-coordinate.
        this.columnHeaders[x] = this.getColumnHeader(initialDate);
        numberData[authorId][x] = [];
        for (
          ;
          y <= this.getNumberOfRowsForTimeframe();
          this.incrementDate(initialDate), this.incrementDate(finalDate), y++
        ) {
          // Set the number for each x- and y-coordinate.
          const currentCommits = this.commitData[authorId].filter((value) => {
            return (
              initialDate.getTime() <= value.getTime() &&
              finalDate.getTime() > value.getTime()
            );
          }).length;
          numberData[authorId][x][y] = currentCommits;
          if (highestNumCommits < currentCommits) {
            highestNumCommits = currentCommits;
          }
        }
        // Reset the y-coordinate. Do this here so we can keep the initial
        // y-coordinate that cooresponds to the earliest date.
        y = 0;
      }

      // Populate the color data with the correct values, given the number data.
      this.colorData[authorId] = [];
      for (let x = 0; x < numberData[authorId].length; x++) {
        this.colorData[authorId][x] = [];
        for (y = 0; y < this.getNumberOfRowsForTimeframe(); y++) {
          const numberDatum = numberData[authorId][x][y];
          if (numberDatum !== undefined) {
            this.colorData[authorId][x][y] = this.minColor.mix(
              this.maxColor,
              !highestNumCommits ? 0 : numberDatum / highestNumCommits,
            );
          } else {
            this.colorData[authorId][x][y] = 'rgba(0, 0, 0, 0)';
          }
        }
      }
    }

    this.generateSVGs();
  }

  /**
   * Returns the column header corresponding to the given date.
   * @param date The date to return the column header for.
   */
  private getColumnHeader(date: Date): string {
    switch (this.timeframe) {
      case Timeframe.Hours:
        return date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });
      case Timeframe.Days:
        return date.toLocaleDateString(undefined, { month: 'short' });
      case Timeframe.Weeks:
        return date.toLocaleDateString(undefined, { month: 'short' });
      case Timeframe.Months:
        return date.toLocaleDateString(undefined, { year: 'numeric' });
      default:
        return date.toLocaleDateString(undefined, { year: 'numeric' });
    }
  }

  /**
   * Returns the number of rows for the current timeframe type. These can mostly
   * be contextualized by the number of those timeframe types in the next
   * biggest timeframe type, with notable exceptions being four rows for weeks,
   * which roughly corresponds to a month, and ten rows for years, which
   * cooresponds to a decade.
   */
  private getNumberOfRowsForTimeframe(): number {
    switch (this.timeframe) {
      case Timeframe.Hours:
        return 24;
      case Timeframe.Days:
        return 7;
      case Timeframe.Weeks:
        return 4;
      case Timeframe.Months:
        return 12;
      case Timeframe.Years:
        return 10;
    }
  }

  /**
   * Sets the number of timeframes between the earliest date and what would
   * be shown as the first date on the punchcard (the top-left cell).
   */
  private setBufferTimeframes(): void {
    let difference: number;
    switch (this.timeframe) {
      case Timeframe.Hours:
        difference = this.earliestDate.getHours();
        break;
      case Timeframe.Days:
        difference = this.getWeekdayIndex(this.earliestDate);
        break;
      case Timeframe.Weeks: {
        // Find the first full week of the month.
        const firstOfMonth = new Date(this.earliestDate.getTime());
        firstOfMonth.setDate(1);
        if (this.getWeekdayIndex(firstOfMonth) !== 0) {
          firstOfMonth.setDate(
            firstOfMonth.getDate() + 7 - this.getWeekdayIndex(firstOfMonth),
          );
        }
        // Get the number of weeks between the earliest date and the Sunday of
        // the first full week of the month.
        difference = Math.floor(
          (this.earliestDate.getDate() - firstOfMonth.getDate()) / 7,
        );
        break;
      }
      case Timeframe.Months:
        difference = this.earliestDate.getMonth();
        break;
      case Timeframe.Years:
        difference = this.earliestDate.getFullYear() % 10;
        break;
    }
    this.bufferTimeframes = difference;
  }

  /**
   * Normalizes the date, meaning that it rounds down to the nearest timeframe.
   * A way to think about it is that it truncates the data lesser than the
   * timeframe. For example, if the timeframe is days, the hours, minutes,
   * seconds, and milliseconds are set to zero.
   * @param date The date to be normalized. Does not edit the original; instead,
   * returns a new date to ensure no loss of data and to follow a functional
   * pattern.
   */
  private normalizeDate(date: Date): Date {
    const normalizedDate = new Date(date.getTime());
    switch (this.timeframe) {
      case Timeframe.Hours:
        normalizedDate.setHours(normalizedDate.getHours(), 0, 0, 0);
        break;
      case Timeframe.Days:
        normalizedDate.setHours(0, 0, 0, 0);
        break;
      case Timeframe.Weeks:
        normalizedDate.setHours(0, 0, 0, 0);
        normalizedDate.setDate(
          normalizedDate.getDate() - this.getWeekdayIndex(normalizedDate),
        );
        break;
      case Timeframe.Months:
        normalizedDate.setHours(0, 0, 0, 0);
        normalizedDate.setDate(1);
        break;
      default:
        normalizedDate.setHours(0, 0, 0, 0);
        normalizedDate.setDate(1);
        normalizedDate.setMonth(0);
        break;
    }
    return normalizedDate;
  }

  /**
   * Returns the weekday index from the given date, with Sunday being index
   * zero. This uses the en-US weekday names to get the indices.
   * @param date The date to get the weekday index from.
   */
  private getWeekdayIndex(date: Date): number {
    return weekdayToNum[date.toLocaleDateString('en-US', { weekday: 'long' })];
  }

  /**
   * Increments the given date to the next timeframe. For example, if the
   * timeframe is days, the date is increased by one.
   * @param date The date to be incremented. Does not edit the original;
   * instead, returns a new date to ensure no loss of data and to follow a
   * functional pattern.
   */
  private incrementDate(date: Date): void {
    switch (this.timeframe) {
      case Timeframe.Hours:
        date.setHours(date.getHours() + 1);
        break;
      case Timeframe.Days:
        date.setDate(date.getDate() + 1);
        break;
      case Timeframe.Weeks:
        date.setDate(date.getDate() + 7);
        break;
      case Timeframe.Months:
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
  }

  /**
   * Sets the colors for the minimum and maximum number of commits.
   * @param minColor The color for zero commits. This defaults to white.
   * @param maxColor The color for the maximum number of commits. This defaults
   * to black.
   */
  public setColors(minColor = '#EEEEEE', maxColor = '#000000'): void {
    this.minColor = new RGBColor(minColor);
    this.maxColor = new RGBColor(maxColor);
  }

  setColumns(gridBuilder: SVGGridBuilder): void {
    for (let idx = 0; idx < this.columnHeaders.length; idx++) {
      switch (this.timeframe) {
        case Timeframe.Hours:
        case Timeframe.Weeks:
        case Timeframe.Months:
          gridBuilder.addColumn(idx % 3 === 0 ? this.columnHeaders[idx] : '');
          break;
        case Timeframe.Days:
          gridBuilder.addColumn(
            this.columnHeaders[idx - 1] !== this.columnHeaders[idx]
              ? this.columnHeaders[idx]
              : '',
          );
          break;
        default:
          gridBuilder.addColumn(idx % 10 ? this.columnHeaders[idx] : '');
          break;
      }
    }
  }

  setRowHeaders(gridBuilder: SVGGridBuilder): void {
    switch (this.timeframe) {
      case Timeframe.Hours:
        gridBuilder.addRowHeaders(
          '12 AM',
          '',
          '2 AM',
          '',
          '4 AM',
          '',
          '6 AM',
          '',
          '8 AM',
          '',
          '10 AM',
          '',
          '12 PM',
          '',
          '2 PM',
          '',
          '4 PM',
          '',
          '6 PM',
          '',
          '8 PM',
          '',
          '10 PM',
          '',
        );
        break;
      case Timeframe.Days:
        gridBuilder.addRowHeaders('Sun', '', 'Tue', '', 'Thu', '', 'Sat');
        break;
      case Timeframe.Weeks:
        gridBuilder.addRowHeaders('Week 1', '', 'Week 3', '');
        break;
      case Timeframe.Months:
        gridBuilder.addRowHeaders(
          'Jan',
          '',
          'Mar',
          '',
          'May',
          '',
          'Jul',
          '',
          'Sep',
          '',
          'Nov',
          '',
        );
        break;
      default:
        gridBuilder.addRowHeaders(
          "'0",
          '',
          "'2",
          '',
          "'4",
          '',
          "'6",
          '',
          "'8",
          '',
        );
    }
  }

  private generateSVGs(): void {
    this.grids = {};
    for (const authorId of Object.keys(this.colorData)) {
      const grid = new SVGGridBuilder();
      this.grids[authorId] = grid; // NB that this is an assignment-by-reference
      this.setColumns(grid);
      this.setRowHeaders(grid);
      for (let x = 0; x < this.colorData[authorId].length; x++) {
        for (const color of this.colorData[authorId][x]) {
          grid.addCell(x, color);
        }
      }
    }
  }

  public getAllSVGs(): { [key: string]: string } {
    return Object.keys(this.grids).reduce(
      (prev, authorId) => ({
        ...prev,
        [authorId]: this.grids[authorId].toString(),
      }),
      {},
    );
  }
}

export default PunchcardsBuilder;
