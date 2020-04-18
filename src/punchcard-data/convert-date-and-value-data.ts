import { PunchcardDataConverter } from './punchcard-data-converter';
import { PunchcardData } from './index';

type dateAndValueDatum = { authorId: string; date: string; value: number };

export const convertDateAndValueData: PunchcardDataConverter<dateAndValueDatum[]> = (rawData) => {
  return rawData.reduce<PunchcardData>((acc, value) => {
    const datum = { date: new Date(value.date), value: value.value };
    if (acc[value.authorId]) acc[value.authorId].push(datum);
    else acc[value.authorId] = [datum];
    return acc;
  }, {});
};
