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
    const red = this.red * (1 - ratioOfColor) + color.red * ratioOfColor;
    const green = this.green * (1 - ratioOfColor) + color.green * ratioOfColor;
    const blue = this.blue * (1 - ratioOfColor) + color.blue * ratioOfColor;

    return (
      '#' +
      Math.round(red).toString(16) +
      Math.round(green).toString(16) +
      Math.round(blue).toString(16)
    );
  }
}

export default RGBColor;
