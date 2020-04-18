/**
 * A class that handles the state and logic for the SVGGridCell.
 */
class SVGGridCell {
  private color: string;
  private cellSize: number;
  private yPosition: number;

  /**
   * Constructs a new grid cell.
   * @param yPosition The y-position of the grid cell.
   * @param cellSize The size of the grid cell.
   * @param color The color of the grid cell.
   */
  public constructor(yPosition: number, cellSize: number, color: string) {
    this.yPosition = yPosition;
    this.cellSize = cellSize;
    this.color = color;
  }

  /**
   * Converts to an SVG template string.
   */
  public toString(): string {
    return `<rect x="0" y="${this.yPosition}" width="${this.cellSize}" height="${this.cellSize}" fill="${this.color}" />`;
  }
}

export default SVGGridCell;
