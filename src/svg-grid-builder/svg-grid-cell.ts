class SVGGridCell {
  private color: string;
  private cellSize: number;
  private xPosition: number;
  private yPosition: number;

  public constructor(
    xPosition: number,
    yPosition: number,
    cellSize: number,
    color: string,
  ) {
    this.xPosition = xPosition;
    this.yPosition = yPosition;
    this.cellSize = cellSize;
    this.color = color;
  }

  public toString() {
    return `
      <rect x="${this.xPosition}" y="${this.yPosition}" width="${this.cellSize}" height="${this.cellSize}" fill="${this.color}" />
    `;
  }
}

export default SVGGridCell;
