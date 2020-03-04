import DateWorker from "./date-worker";

import { PunchcardData, PunchcardWorkingData, PunchcardMode, PunchcardOptions, maxDays, maxWeeks, maxMonths, weekdayToNum } from "./models";

/**
 * This class creates and updates punchcards, given the commit data for some
 * authors.
 * @author Zachary Canoy @zaccanoy
 */
class Punchcard {
  /** All commit data, sorted by author. */
  private data: PunchcardData;
  /** The working data for the current mode. */
  private workingData: PunchcardWorkingData;
  /** The earliest date in the commit history. */
  private earliestDate: Date;
  /** The latest date in the commit history. */
  private latestDate: Date;
  /** The current mode of the punchcard. */
  private mode: PunchcardMode;
  /** The number of days between the earliest date and the latest date. */
  private numDays: number;
  /** The highest number of commits for the given mode and data. */
  private highestCommits: number;

  /**
   * Constructs a punchcard with the given options.
   * @param options The options for the punchcard.
   */
  public constructor(options: PunchcardOptions) {
    // Make commit feed data usable for the punchcard.
    this.data = options.data.reduce((dataByAuthor, element) => {
      // Make a Date object from the commit date.
      const date = new Date(element["commit_date"]);
      // If the commit date is before earliestDate or after latestDate,
      // adjust accordingly.
      if (this.earliestDate == null || date < this.earliestDate) {
        this.earliestDate = date;
      } else if (this.latestDate == null || date > this.latestDate) {
        this.latestDate = date;
      }

      // Add the current commit element to the data for the proper author.
      return {
        ...dataByAuthor,
        [element["author_name"]]: [
          ...element["author_name"],
          new Date(element["commit_date"])
        ]
      };
    }, <PunchcardData>{});

    // Get the number of days between the first and last commit.
    this.numDays =
      (this.latestDate.getTime() - this.earliestDate.getTime()) /
      (1000 * 60 * 60 * 24);

    // Find the appropriate mode to display given the number of days between
    // the least recent and most recent commits.
    this.updateMode(options.mode || this.getSuggestedMode());
  }

  private setWorkingData(func: (commitDate: Date) => void) {
    Object.keys(this.data).forEach(authorId => {
      const safeDates = this.data[authorId].map(date => new Date(date));
      this.workingData[authorId] = safeDates.reduce((data, date) => {
        func(date);
        const dateString = date.getTime();
        return {
          ...data,
          [dateString]: data[dateString] + 1 || 1
        };
      }, {});
    });
  }

  /**
   * Returns the suggested punchcard mode given the number of days in the
   * system.
   * @returns The suggested punchcard mode given the number of days in the
   * system.
   */
  public getSuggestedMode(): PunchcardMode {
    if (this.numDays <= maxDays) return PunchcardMode.Days;
    else if (this.numDays <= maxWeeks) return PunchcardMode.Weeks;
    else if (this.numDays <= maxMonths) return PunchcardMode.Months;
    else return PunchcardMode.Years;
  }

  /**
   * Updates the mode of the punchcard to reflect the needs of the caller.
   * @param mode The mode for the punchcard to be generated in.
   */
  public updateMode(mode: PunchcardMode) {
    // Update the mode.
    this.mode = mode;

    // Set the working data based on the mode.
    switch (mode) {
      case PunchcardMode.Days:
        // Set to the beginning of the day.
        this.setWorkingData(date => DateWorker.convertToBeginningOfDay(date));
        break;
      case PunchcardMode.Weeks:
        this.setWorkingData(date => DateWorker.convertToBeginningOfWeek(date));
        break;
      case PunchcardMode.Months:
        this.setWorkingData(date => DateWorker.convertToBeginningOfMonth(date));
        break;
      default:
        // PunchcardMode.Years
        this.setWorkingData(date => DateWorker.convertToBeginningOfYear(date));
        break;
    }
    this.setHighestCommits();
  }

  private setHighestCommits() {
    let highestCommits;
    Object.keys(this.workingData).forEach(author => {
      Object.keys(this.workingData[author]).forEach(dateString => {
        highestCommits =
          this.workingData[author][dateString] > highestCommits
            ? this.workingData[author][dateString]
            : highestCommits;
      });
    });
    this.highestCommits = highestCommits;
  }

  private getHexCodeForCommits(commits: number) {
    let decimalColor = (commits / this.highestCommits) * 255;
    let hexColor = Math.round(decimalColor).toString(16);
    return hexColor + hexColor + hexColor;
  }

  private getColorData(
    initializeDate: (date: Date) => void,
    incrementDate: (date: Date) => void
  ) {
    let colorData = {};
    let date = new Date(this.earliestDate);
    initializeDate(date);
    Object.keys(this.workingData).forEach(authorId => {
      colorData[authorId] = {};
      while (date <= this.latestDate) {
        colorData[authorId][date.getTime()] = this.getHexCodeForCommits(
          this.workingData[authorId][date.getTime()] || 0
        );
        incrementDate(date);
      }
    });
    return colorData;
  }

  private getColData(
    dates: Date[],
    getColName: (date: Date) => string,
    diffFromFirstOfCol: (date: Date) => number,
    numRows: number
  ) {
    let idx = 0;
    let colData = [];
    let firstFullIdx;
    while (idx < dates.length) {
      colData.push(getColName(dates[idx]));
      if (diffFromFirstOfCol(dates[idx]) != 0) {
        idx += diffFromFirstOfCol(dates[idx]);
      } else {
        if (firstFullIdx === undefined) {
          firstFullIdx = idx;
        }
        idx += numRows;
      }
    }
    return colData;
  }

  /**
   * Returns a set of SVG cards for the current data and mode.
   */
  public getCards() {
    let colorData;
    let firstFullIndex = -1;
    let colData = [];
    switch (this.mode) {
      case PunchcardMode.Days:
        colorData = this.getColorData(
          DateWorker.convertToBeginningOfDay,
          date => date.setDate(date.getDate() + 1)
        );
        colData = this.getColData(
          colorData.map(date => new Date(date)),
          date => date.toLocaleDateString("en-us", { month: "short" }),
          date =>
            7 -
            weekdayToNum[date.toLocaleDateString("en-us", { weekday: "long" })],
          7
        );
        break;
      case PunchcardMode.Weeks:
        colorData = this.getColorData(
          DateWorker.convertToBeginningOfWeek,
          date => date.setDate(date.getDate() + 7)
        );
        colData = this.getColData(
          colorData.map(date => new Date(date)),
          date => date.toLocaleDateString("en-us", { year: "numeric" }),
          date => {
            const nextMonth = new Date(date);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            nextMonth.setDate(1);
            return (nextMonth.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 4);
          },
          4
        );
        break;
      case PunchcardMode.Months:
        colorData = this.getColorData(
          DateWorker.convertToBeginningOfDay,
          date => date.setMonth(date.getMonth() + 1)
        );
        colData = this.getColData(
          colorData.map(date => new Date(date)),
          date => "" + (date.getFullYear() - (date.getFullYear() % 5)),
          date => {
            const nextYear = new Date(date);
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            nextYear.setMonth(0);
            nextYear.setDate(1);
            return (nextYear.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30);
          },
          12
        )
        break;
      default:
        colorData = this.getColorData(
          DateWorker.convertToBeginningOfDay,
          date => date.setFullYear(date.getFullYear() + 1)
        );
        break;
    }
  }
}
