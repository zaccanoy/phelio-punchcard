import { RGBColor } from './rgb-color';
import { PunchcardOptions } from './punchcard-options';
import { SVGGridBuilder } from './svg-grid-builder/svg-grid-builder';
import { Timeframe } from './timeframe';
import { PunchcardData } from './punchcard-data/index';
import { PunchcardUtilities } from './punchcard-utilities';

export class PunchcardsBuilder<T> {
  /** The data to work with. */
  private data: PunchcardData;
  /** The earliest date in the data. */
  private earliestDate: Date;
  /** The latest date in the data. */
  private latestDate: Date;
  /** The timeframe for the punchcards. */
  private timeframe: Timeframe;
  /** The color for the value zero. */
  private minColor: RGBColor;
  /** The color for the maximum value. */
  private maxColor: RGBColor;
  /** The number of cells between the earliest date and what would be the
   * top-left corner of the punchcards. */
  private bufferTimeframes: number;
  /** The color data for the punchcard is a two-dimensional array of strings
   * representing the colors at every x- and y-coordinate in each punchcard,
   * seperated by ID. */
  private colorData: { [key: string]: string[][] };
  private columnHeaders: string[];
  private grids: { [key: string]: SVGGridBuilder };

  /**
   * Constructs a new Punchcard instance.
   * @param rawData The source data.
   * @param punchcardOptions The options for the Punchcard instance.
   */
  public constructor(rawData: T, punchcardOptions: PunchcardOptions<T>) {
    this.setColors(punchcardOptions.minColor, punchcardOptions.maxColor);
    this.data = punchcardOptions.converterFunction(rawData);
    const { earliestDate, latestDate } = PunchcardUtilities.getEarliestAndLatestDates(this.data);
    this.earliestDate = earliestDate;
    this.latestDate = latestDate;
    this.timeframe = punchcardOptions.timeframe | PunchcardUtilities.getTimeframe(earliestDate, latestDate);
    this.bufferTimeframes = PunchcardUtilities.getBufferTimeframes(this.timeframe, earliestDate);
    this.setColorData();
    this.generateSVGs();
  }

  /**
   * Sets the color data for the SVGs. After this is called, the SVGs will be
   * generated again. Changes to the data or timeframe will trigger this
   * function to be called.
   */
  private setColorData(): void {
    this.columnHeaders = [];
    let highestValue = 0;
    this.colorData = {};

    for (const id of Object.keys(this.data)) {
      const initialDate = PunchcardUtilities.normalizeDate(this.timeframe, this.earliestDate);
      // Each element in the array is the values as number data.
      const numberData: { [key: string]: number[][] } = {};
      // The final date is initialized to the next timeframe andalso incremented.
      const finalDate = new Date(initialDate.getTime());
      PunchcardUtilities.incrementDate(this.timeframe, finalDate);
      numberData[id] = [];
      // Get the first timeframe index, this will be the first y index in our
      // two-dimensional array of timeframes.
      let y = this.bufferTimeframes;
      // Loop through the current x-coordinate. This should continue until the
      // initial date is greater than the latest date in the data. Every
      // iteration, we increment the x-coordinate.
      for (let x = 0; initialDate.getTime() <= this.latestDate.getTime(); x++) {
        // Loop through the current y-coordinate. This should continue until the
        // initial date is greater than the latest date in the data or the
        // y-coordinate is greater than or equal to the number of rows for the
        // current timeframe. Every iteration, we increment the initial date,
        // the final date, and the y-coordinate.
        this.columnHeaders[x] = PunchcardUtilities.getColumnHeader(this.timeframe, initialDate);
        numberData[id][x] = [];
        for (
          ;
          y < PunchcardUtilities.getNumberOfRowsForTimeframe(this.timeframe);
          PunchcardUtilities.incrementDate(this.timeframe, initialDate),
            PunchcardUtilities.incrementDate(this.timeframe, finalDate),
            y++
        ) {
          // Set the number for each x- and y-coordinate.
          const currentValue = this.data[id]
            .filter((value) => {
              return initialDate.getTime() <= value.date.getTime() && finalDate.getTime() > value.date.getTime();
            })
            .reduce<number>((acc, value) => (acc += value.value), 0);
          numberData[id][x][y] = currentValue;
          if (highestValue < currentValue) {
            highestValue = currentValue;
          }
        }
        // Reset the y-coordinate. Do this here so we can keep the initial
        // y-coordinate that cooresponds to the earliest date.
        y = 0;
      }

      // Populate the color data with the correct values, given the number data.
      this.colorData[id] = [];
      for (let x = 0; x < numberData[id].length; x++) {
        this.colorData[id][x] = [];
        const numRows = PunchcardUtilities.getNumberOfRowsForTimeframe(this.timeframe);
        for (y = 0; y < numRows; y++) {
          const numberDatum = numberData[id][x][y];
          if (numberDatum !== undefined) {
            this.colorData[id][x][y] = this.minColor.mix(this.maxColor, !highestValue ? 0 : numberDatum / highestValue);
          } else {
            this.colorData[id][x][y] = 'rgba(0, 0, 0, 0)';
          }
        }
      }
    }
  }

  /**
   * Sets the colors for the minimum and maximum values.
   * @param minColor The color for value zero. This defaults to white.
   * @param maxColor The color for the maximum value. This defaults to black.
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
          gridBuilder.addColumn(this.columnHeaders[idx - 1] !== this.columnHeaders[idx] ? this.columnHeaders[idx] : '');
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
        gridBuilder.addRowHeaders('Jan', '', 'Mar', '', 'May', '', 'Jul', '', 'Sep', '', 'Nov', '');
        break;
      default:
        gridBuilder.addRowHeaders("'0", '', "'2", '', "'4", '', "'6", '', "'8", '');
    }
  }

  private generateSVGs(): void {
    this.grids = {};
    for (const id of Object.keys(this.colorData)) {
      const grid = new SVGGridBuilder();
      this.grids[id] = grid; // NB that this is an assignment-by-reference
      this.setColumns(grid);
      this.setRowHeaders(grid);
      for (let x = 0; x < this.colorData[id].length; x++) {
        for (const color of this.colorData[id][x]) {
          grid.addCell(x, color);
        }
      }
    }
  }

  public getAllSVGs(): { [key: string]: string } {
    return Object.keys(this.grids).reduce(
      (prev, id) => ({
        ...prev,
        [id]: this.grids[id].toString(),
      }),
      {},
    );
  }
}
