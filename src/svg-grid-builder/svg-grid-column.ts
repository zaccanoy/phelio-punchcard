import SVGGridCell from './svg-grid-cell';

class SVGGridColumn {
  private xPosition: number;
  private cellSize: number;
  private cellBox: number;
  private header: string;
  private cells: SVGGridCell[];

  public constructor(
    xPosition: number,
    cellSize: number,
    cellPadding: number,
    header: string,
    cells?: SVGGridCell[],
  ) {
    this.xPosition = xPosition;
    this.cellSize = cellSize;
    this.cellBox = cellSize + cellPadding;
    this.header = header;
    this.cells = cells || [];
  }

  public addCell(color: string): void {
    this.cells.push(
      new SVGGridCell(
        0,
        this.cellBox * this.cells.length,
        this.cellSize,
        color,
      ),
    );
  }

  public toString(): string {
    return `
    <g transform="translate(${this.xPosition}, 0)">
      <text font-size="11" font-family="sans-serif" x="0" y="-4">${
        this.header
      }</text>
      ${this.cells.map((cell) => cell.toString()).join('')}
    </g>
    `;
  }

  public length(): number {
    return this.cells.length;
  }
}

export default SVGGridColumn;
