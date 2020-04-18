import { PunchcardData } from './punchcard-data';

export interface PunchcardDataConverter<T> {
  (rawData: T): PunchcardData;
}
