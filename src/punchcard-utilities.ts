import { PunchcardData } from './punchcard-data/index';
import { Timeframe } from './index';

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
/** The number of milliseconds in a day. */
const millisecondsInDay = 86400000;
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

export class PunchcardUtilities {
  public static getEarliestAndLatestDates(data: PunchcardData): { earliestDate: Date; latestDate: Date } {
    let earliestDate: Date, latestDate: Date;
    [].concat(...Object.values(data)).forEach((value) => {
      if (earliestDate === undefined || earliestDate.getTime() > value.date.getTime()) {
        earliestDate = value.date;
      }
      if (latestDate === undefined || latestDate.getTime() < value.date.getTime()) {
        latestDate = value.date;
      }
    });

    return {
      earliestDate: new Date(earliestDate),
      latestDate: new Date(latestDate),
    };
  }

  public static getTimeframe(earliestDate: Date, latestDate: Date): Timeframe {
    const numDays = (latestDate.getTime() - earliestDate.getTime()) / millisecondsInDay;
    if (numDays <= maxDays) return Timeframe.Days;
    else if (numDays <= maxWeeks) return Timeframe.Weeks;
    else if (numDays <= maxMonths) return Timeframe.Months;
    else return Timeframe.Years;
  }

  /**
   * Returns the weekday index from the given date, with Sunday being index
   * zero. This uses the en-US weekday names to get the indices.
   * @param date The date to get the weekday index from.
   */
  private static getWeekdayIndex(date: Date): number {
    return weekdayToNum[date.toLocaleDateString('en-US', { weekday: 'long' })];
  }

  public static getBufferTimeframes(timeframe: Timeframe, earliestDate: Date): number {
    switch (timeframe) {
      case Timeframe.Hours:
        return earliestDate.getHours();
      case Timeframe.Days:
        return this.getWeekdayIndex(earliestDate);
      case Timeframe.Weeks: {
        // Find the first full week of the month.
        const firstOfMonth = new Date(earliestDate.getTime());
        firstOfMonth.setDate(1);
        if (this.getWeekdayIndex(firstOfMonth) !== 0) {
          firstOfMonth.setDate(firstOfMonth.getDate() + 7 - this.getWeekdayIndex(firstOfMonth));
        }
        // Get the number of weeks between the earliest date and the Sunday of
        // the first full week of the month.
        return Math.floor((earliestDate.getDate() - firstOfMonth.getDate()) / 7);
      }
      case Timeframe.Months:
        return earliestDate.getMonth();
      case Timeframe.Years:
        return earliestDate.getFullYear() % 10;
    }
  }

  /**
   * Returns the column header corresponding to the given date.
   * @param timeframe The timeframe being used.
   * @param date The date to return the column header for.
   */
  public static getColumnHeader(timeframe: Timeframe, date: Date): string {
    switch (timeframe) {
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
   * @param timeframe The timeframe being used.
   */
  public static getNumberOfRowsForTimeframe(timeframe: Timeframe): number {
    switch (timeframe) {
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
   * Normalizes the date, meaning that it rounds down to the nearest timeframe.
   * A way to think about it is that it truncates the data lesser than the
   * timeframe. For example, if the timeframe is days, the hours, minutes,
   * seconds, and milliseconds are set to zero.
   * @param timeframe The timeframe being used.
   * @param date The date to be normalized. Does not edit the original; instead,
   * returns a new date to ensure no loss of data and to follow a functional
   * pattern.
   */
  public static normalizeDate(timeframe: Timeframe, date: Date): Date {
    const normalizedDate = new Date(date.getTime());
    switch (timeframe) {
      case Timeframe.Hours:
        normalizedDate.setHours(normalizedDate.getHours(), 0, 0, 0);
        break;
      case Timeframe.Days:
        normalizedDate.setHours(0, 0, 0, 0);
        break;
      case Timeframe.Weeks:
        normalizedDate.setHours(0, 0, 0, 0);
        normalizedDate.setDate(normalizedDate.getDate() - PunchcardUtilities.getWeekdayIndex(normalizedDate));
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
   * Increments the given date to the next timeframe. For example, if the
   * timeframe is days, the date is increased by one.
   * @param timeframe The timeframe being used.
   * @param date The date to be incremented. Does not edit the original;
   * instead, returns a new date to ensure no loss of data and to follow a
   * functional pattern.
   */
  public static incrementDate(timeframe: Timeframe, date: Date): void {
    switch (timeframe) {
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
}
