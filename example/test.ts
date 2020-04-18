/* eslint-disable @typescript-eslint/camelcase */
import { PunchcardsBuilder, convertDateData, convertDateAndValueData } from '../src/index';

const testData = [{ authorId: 'alananderson', date: 'May 1, 2020', value: 1 }];

window.onload = (): void => {
  const punchcardsBuilder = new PunchcardsBuilder(testData, {
    maxColor: '#990000',
    converterFunction: convertDateAndValueData,
  });
  document.body.innerHTML += punchcardsBuilder.getAllSVGs()['alananderson'];
};
