/* eslint-disable @typescript-eslint/camelcase */
import { PunchcardsBuilder, convertDateAndValueData } from '../src/index';

const testData = [
  { id: 'alananderson', date: 'May 1, 2020', value: 1 },
  { id: 'alananderson', date: 'May 5, 2020', value: 50 },
  { id: 'alananderson', date: 'May 6, 2020', value: 100 },
  { id: 'alananderson', date: 'May 19, 2020', value: 90 },
];

window.onload = (): void => {
  const punchcardsBuilder = new PunchcardsBuilder(testData, {
    maxColor: '#990000',
    converterFunction: convertDateAndValueData,
    startAtRatio: 0.25,
  });
  document.body.innerHTML += punchcardsBuilder.getAllSVGs()['alananderson'];
};
