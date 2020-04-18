import SVGGridCell from './svg-grid-cell';

/**
 * A class that handles the state and functionality of an SVG grid column.
 */
class SVGGridColumn {
  private xPosition: number;
  private cellSize: number;
  private cellBox: number;
  private header: string;
  private cells: SVGGridCell[];

  /**
   * Constructs a new SVGGridColumn.
   *
   * @param xPosition The x-position of the grid column.
   * @param cellSize The size of the cells in the column.
   * @param cellPadding The padding on the cells in the column.
   * @param header The header for the column.
   * @param cells The cells for the column; can be set later.
   */
  public constructor(xPosition: number, cellSize: number, cellPadding: number, header: string, cells?: SVGGridCell[]) {
    this.xPosition = xPosition;
    this.cellSize = cellSize;
    this.cellBox = cellSize + cellPadding;
    this.header = header;
    this.cells = cells || [];
  }

  /**
   * Appends a cell to the column.
   * @param color The color of the cell to add.
   */
  public addCell(color: string): void {
    this.cells.push(new SVGGridCell(this.cellBox * this.cells.length, this.cellSize, color));
  }

  /**
   * Converts the column to an SVG template string.
   */
  public toString(): string {
    return `<g transform="translate(${this.xPosition}, 0)"><text font-size="11" font-family="sans-serif" x="0" y="-4">${
      this.header
    }</text>${this.cells.map((cell) => cell.toString()).join('')}</g>`;
  }

  /**
   * Returns the number of cells in the column.
   */
  public length(): number {
    return this.cells.length;
  }
}

export default SVGGridColumn;
