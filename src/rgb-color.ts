class RGBColor {
  public red: number;
  public green: number;
  public blue: number;

  public constructor(hexString: string) {
    this.red = parseInt(hexString.substr(1, 2), 16) / 255;
    this.green = parseInt(hexString.substr(3, 2), 16) / 255;
    this.blue = parseInt(hexString.substr(5, 2), 16) / 255;
  }

  public mix(color: RGBColor, ratioOfColor: number) {
    const red =
      255 * (this.red * (1 - ratioOfColor) + color.red * ratioOfColor);
    const green =
      255 * (this.green * (1 - ratioOfColor) + color.green * ratioOfColor);
    const blue =
      255 * (this.blue * (1 - ratioOfColor) + color.blue * ratioOfColor);

    const redString =
      Math.round(red) > 15
        ? Math.round(red).toString(16)
        : '0' + Math.round(red).toString(16);
    const greenString =
      Math.round(green) > 15
        ? Math.round(green).toString(16)
        : '0' + Math.round(green).toString(16);
    const blueString =
      Math.round(blue) > 15
        ? Math.round(blue).toString(16)
        : '0' + Math.round(blue).toString(16);

    return '#' + redString + greenString + blueString;
  }
}

export default RGBColor;
