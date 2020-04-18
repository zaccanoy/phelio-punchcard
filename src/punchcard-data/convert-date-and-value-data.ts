import { PunchcardDataConverter } from './punchcard-data-converter';
import { PunchcardData } from './index';

type dateAndValueDatum = { id: string; date: string; value: number };

export const convertDateAndValueData: PunchcardDataConverter<dateAndValueDatum[]> = (rawData) => {
  return rawData.reduce<PunchcardData>((acc, value) => {
    const datum = { date: new Date(value.date), value: value.value };
    if (acc[value.id]) acc[value.id].push(datum);
    else acc[value.id] = [datum];
    return acc;
  }, {});
};
