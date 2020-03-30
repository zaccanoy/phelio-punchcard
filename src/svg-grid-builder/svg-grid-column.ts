import SVGGridCell from './svg-grid-cell';

class SVGGridColumn {
  private xPosition: number;
  private cellSize: number;
  private header: string;
  private cells: SVGGridCell[];

  public constructor(
    xPosition: number,
    cellSize: number,
    header: string,
    cells?: SVGGridCell[],
  ) {
    this.xPosition = xPosition;
    this.cellSize = cellSize;
    this.header = header;
    this.cells = cells || [];
  }

  public addCell(color: string) {
    this.cells.push(
      new SVGGridCell(
        0,
        this.cellSize * this.cells.length,
        this.cellSize,
        color,
      ),
    );
  }

  public toString() {
    return `
    <g translate(${this.xPosition}, 0)>
      <text x="0" y="-8">${this.header}</text>
      ${this.cells.forEach((cell) => cell.toString())}
    </g>
    `;
  }

  public length() {
    return this.cells.length;
  }
}

export default SVGGridColumn;
