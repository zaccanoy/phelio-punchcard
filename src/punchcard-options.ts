import { Timeframe } from './timeframe';
import { PunchcardDataConverter } from './punchcard-data/index';

/**
 * The options for building a punchcard.
 */
export interface PunchcardOptions<T> {
  /** The timeframe, if you don't want it to be chosen dynamically. */
  timeframe?: Timeframe;
  /** The color for a minimum value. */
  minColor?: string;
  /** The color for a maximum value. */
  maxColor?: string;
  /** The function for converting the data. */
  converterFunction: PunchcardDataConverter<T>;
}
