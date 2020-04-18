import { PunchcardDataConverter } from './punchcard-data-converter';
import { convertDateAndValueData } from './convert-date-and-value-data';

type dateDatum = { id: string; date: string };

export const convertDateData: PunchcardDataConverter<dateDatum[]> = (rawData) => {
  return convertDateAndValueData(rawData.map((datum) => ({ ...datum, value: 1 })));
};
