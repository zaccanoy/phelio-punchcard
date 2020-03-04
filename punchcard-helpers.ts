/** A mapping to convert weekday names to distances from Sunday. */
export const weekdayToNum = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
  };

export function getWeekday(date: Date): string {
    return date.toLocaleDateString("en-US", { weekday: "long" });
}

export function getWeekdayIndex(date: Date): number {
    return weekdayToNum[getWeekday(date)];
}
