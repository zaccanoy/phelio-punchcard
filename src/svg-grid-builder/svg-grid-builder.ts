import SVGGridBuilderOptions from './svg-grid-builder-options';
import SVGGridColumn from './svg-grid-column';

class SVGGridBuilder {
  private cellSize = 14;
  private cellPadding = 2;
  private cellBox: number;
  private columns: SVGGridColumn[];
  private rowHeaders: string[];

  public constructor(options: SVGGridBuilderOptions) {
    this.cellSize = options.cellSize || this.cellSize;
    this.cellPadding = options.cellPadding || this.cellPadding;
    this.cellBox = this.cellSize + this.cellPadding;
  }

  public addColumn(header: string) {
    this.columns[this.columns.length] = new SVGGridColumn(
      this.cellBox * this.columns.length,
      this.cellSize,
      header,
    );
  }

  public addRowHeader(yPosition: number, header: string) {
    this.rowHeaders[yPosition] = header;
  }

  public addCell(x: number, color: string): void {
    this.columns[x].addCell(color);
  }

  public toString(): string {
    return `
      <svg width="${this.cellSize * this.columns.length}" height="${
      this.cellSize * Math.max(...this.columns.map((col) => col.length()))
    }">
        <g transform="translate(10, 20)">
          ${this.columns.forEach((column) => column.toString())}
        </g>
        <g>
          ${this.rowHeaders.forEach(
            (rowHeader, index) => `
          <text x="0" y="${index * this.cellBox}">${
              rowHeader ? rowHeader : ''
            }</text>
        `,
          )}
        </g>
      </svg>
    `;
  }
}

export default SVGGridBuilder;
