import PunchcardsBuilder from '../src';
import data from './test-data';
import Timeframe from '../src/timeframe';

window.onload = () => {
  let punchcardsBuilder = new PunchcardsBuilder(data, {
    maxColor: '#990000',
  });
  document.getElementById(
    'entry',
  ).innerHTML = punchcardsBuilder.getAllSVGs()[1];
};
