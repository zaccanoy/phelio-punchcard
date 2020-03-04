/**
 * A representation of a hexadecimal color, given in #RRGGBB.
 * @author Zac Canoy @zaccanoy
 */
export class HexColor {
    
    /** The value of the red component of the color, from 0 - 255. */
    public redValue: number;
    /** The value of the green component of the color, from 0 - 255. */
    public greenValue: number;
    /** The value of the blue component of the color, from 0 - 255. */
    public blueValue: number;

    /**
     * Constructs a new HexColor with the given color values.
     * @param hexColor The hexadecimal represenetation of the color to be stored. Can be given as RRGGBB or #RRGGBB.
     */
    constructor(hexColor: string) {
        let startIdx = 0;
        if (hexColor.substr(0, 1) === "#") {
            startIdx = 1;
        }
        this.redValue = parseInt(hexColor.substr(startIdx, 2), 16);
        this.greenValue = parseInt(hexColor.substr(startIdx + 2, 2), 16);
        this.blueValue = parseInt(hexColor.substr(startIdx + 4, 2), 16);
    }

    /**
     * Mixes a percentage of another color with this one. Returns with a pound at the beginning.
     * @param color The color to mix with this one.
     * @param percentageOfOther The percentage of the other color to mix with this one.
     */
    public mixWithOther(color: HexColor, percentageOfOther: number) {
        // colorA * percentage + colorB * (1 - percentage)
        let redMix = color.redValue * percentageOfOther + this.redValue * (1 - percentageOfOther);
        let greenMix = color.greenValue * percentageOfOther + this.greenValue * (1 - percentageOfOther);
        let blueMix = color.blueValue * percentageOfOther + this.blueValue * (1 - percentageOfOther);
        return "#" + redMix.toString(16) + greenMix.toString(16) + blueMix.toString(16);
    }

}

/**
 * Generates colors between the given values based on the value being used.
 * @author Zachary Canoy @zaccanoy
 */
export class ColorGenerator {

    /** The color for the minimum value. */
    minColor: HexColor;
    /** The color for the maximum value. */
    maxColor: HexColor;
    /** The minimum value. */
    minValue: number;
    /** The maximum value. */
    maxValue: number;

    /**
     * Constructs a new ColorGenerator with the given minColor, maxColor, minValue, and maxValue.
     * @param minColor The color for the minimum value.
     * @param maxColor The color for the maximum value.
     * @param minValue The minimum value.
     * @param maxValue The maximum value.
     */
    public constructor(minColor: HexColor, maxColor: HexColor, minValue: number, maxValue: number) {
        this.minColor = minColor;
        this.maxColor = maxColor;
        this.minValue = minValue;
        this.maxValue = maxValue;
    }

    /**
     * Returns the color corresponding to teh given value.
     * @param value The value to use to generate the color. Should be between the minimum and maximum values.
     */
    public getColor(value: number) {
        return this.minColor.mixWithOther(this.maxColor, (value - this.minValue) / (this.maxValue - this.minValue));
    }

}
