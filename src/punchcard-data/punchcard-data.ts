export type PunchcardDatum = { date: Date; value: number };
export type PunchcardData = { [key: string]: PunchcardDatum[] };
