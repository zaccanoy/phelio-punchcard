/**
 * @author Zachary Canoy @zaccanoy
 */

/**
 * The mode for the punchcard. Each option changes formatting.
 */
export enum PunchcardMode {
  Hours,
  Days,
  Weeks,
  Months,
  Years
}

/**
 * The shape of the commit object that is used to build the Punchcard.
 */
export interface Commit {
  commit_date: string;
  author_id: string;
}

/**
 * Represents the stored data for a punchcard. The key is the author's ID,
 * and the value is an array of Dates that commits have been made.
 */
export interface PunchcardData {
  [key: string]: Date[];
}

/**
 * Represents the working datum for a single date for generating a punchcard.
 * The key is the date in milliseconds and the value is the number of commits
 * made in that time period.
 */
export interface PunchcardWorkingDatum {
  [key: string]: number;
}

/**
 * Represents the working data for generating a punchcard. The outer key is the
 * author's ID, and the inner key is the date as a string.
 */
export interface PunchcardWorkingData {
  [key: string]: PunchcardWorkingDatum;
}

/**
 * This interface contains the options for the Punchcard constructor.
 */
export interface PunchcardOptions {
  /** The mode for the punchcard to be in. */
  mode?: PunchcardMode;
  /** The data for the punchcard to contain. */
  data: Commit[];
}

/** The preferred number of columns. It is set to 30 by default for aesthetic
 * purposes. */
export const numCols = 30;
/** The maximum number for the recommended mode to be days, which is the
 * number of days in a week multiplied by the preferred number of columns. */
export const maxDays = 7 * numCols;
/** The maximum number for the recommended mode to be weeks, which is the
 * approximate number of days in a month multiplied by the preferred number of
 * columns. */
export const maxWeeks = 30 * numCols;
/** The maximum number for the recommended mode to be months, which is the
 * approximate number of days in a year multiplied by the preferred number of
 * columns. */
export const maxMonths = 365 * numCols;
/** A mapping to convert weekday names to distances from Sunday. */
export const weekdayToNum = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};
