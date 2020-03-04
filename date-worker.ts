import { weekdayToNum } from './models';

export module DateWorker {
  export function convertToBeginningOfDay(date: Date) {
    // Set to the beginning of the day.
    this.setWorkingData(date => date.setHours(0, 0, 0, 0));
  }

  export function convertToBeginningOfWeek(date: Date) {
    // Set to the beginning of the day.
    date.setHours(0, 0, 0, 0);
    // Set to the beginning of the week.
    date.setDate(
      date.getDate() -
        weekdayToNum[
          date.toLocaleDateString("en-us", {
            weekday: "long"
          })
        ]
    );
  }

  export function convertToBeginningOfMonth(date: Date) {
    // Set to the beginning of the day.
    date.setHours(0, 0, 0, 0);
    // Set to the beginning of the month.
    date.setDate(1);
  }

  export function convertToBeginningOfYear(date: Date) {
    // Set to the beginning of the day.
    date.setHours(0, 0, 0, 0);
    // Set to the beginning of the month.
    date.setDate(1);
    // Set to the beginning of the year.
    date.setMonth(0);
  }
}

export default DateWorker;
