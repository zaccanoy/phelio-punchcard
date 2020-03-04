import { ColorGenerator } from "./color-generator";
import { getWeekdayIndex } from "./punchcard-helpers";
import CommitCount from "./commit-count";

abstract class DailyPunchcard {

    private authorName: string;
    private commitDates: Date[];
    private colorGenerator: ColorGenerator;
    private firstSundayIdx: number;

    public constructor(colorGenerator: ColorGenerator) {
        this.colorGenerator = colorGenerator;
    }

    /**
     * Sets the card's local data.
     */
    public setData(authorName: string, commitDates: Date[]): void {
        this.authorName = authorName;
        this. = commitDates.reduce(date => {
            const safeDate = new Date(date);
            safeDate.setHours(0, 0, 0, 0);
            return safeDate;
        }, []);
        this.firstSundayIdx = this.commitDates.findIndex(date => getWeekdayIndex(date) === 0);
        this.commitColors = this.commitDates.map(date => this.colorGenerator.getColor())
    }

}
