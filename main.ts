/**
 * @author Zachary Canoy @zaccanoy
 */

/**
 * The mode for the punchcard. Each option changes formatting.
 */
enum PunchcardMode {
  Hours,
  Days,
  Weeks,
  Months,
  Years
}

/**
 * The shape of the commit object that is used to build the Punchcard.
 */
interface Commit {
  commit_date: string;
  author_id: string;
}

/**
 * Represents the stored data for a punchcard. The key is the author's ID,
 * and the value is an array of Dates that commits have been made.
 */
interface PunchcardData {
  [key: string]: Date[];
}

/**
 * Represents the working datum for a single date for generating a punchcard.
 * The key is the date in milliseconds and the value is the number of commits
 * made in that time period.
 */
interface PunchcardWorkingDatum {
  [key: string]: number;
}

/**
 * Represents the working data for generating a punchcard. The outer key is the
 * author's ID, and the inner key is the date as a string.
 */
interface PunchcardWorkingData {
  [key: string]: PunchcardWorkingDatum;
}

/**
 * This interface contains the options for the Punchcard constructor.
 */
interface PunchcardOptions {
  /** The mode for the punchcard to be in. */
  mode?: PunchcardMode;
  /** The data for the punchcard to contain. */
  data: Commit[];
}

/** The preferred number of columns. It is set to 30 by default for aesthetic
 * purposes. */
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
const weekdayToNum = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};
