/* eslint-disable @typescript-eslint/camelcase */
import { PunchcardsBuilder, convertDateData, convertDateAndValueData } from '../src/index';

const testData = [
  { authorId: 'zaccanoy@gmail.com', date: 'May 9, 2020', value: 3 },
  { authorId: 'alananderson', date: 'May 1, 2020', value: 3 },
  { authorId: 'alananderson', date: 'May 19, 2020', value: 3 },
  { authorId: 'alananderson', date: 'May 23, 2020', value: 1 },
  { authorId: 'alananderson', date: 'May 8, 2020', value: 3 },
  { authorId: 'alananderson', date: 'May 4, 2020', value: 3 },
  { authorId: 'alananderson', date: 'May 5, 2020', value: 39 },
];

window.onload = (): void => {
  const punchcardsBuilder = new PunchcardsBuilder(testData, {
    maxColor: '#990000',
    converterFunction: convertDateAndValueData,
  });
  document.body.innerHTML += punchcardsBuilder.getAllSVGs()['alananderson'];
};
