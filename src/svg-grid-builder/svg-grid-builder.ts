import SVGGridBuilderOptions from './svg-grid-builder-options';
import SVGGridColumn from './svg-grid-column';

class SVGGridBuilder {
  private cellSize = 14;
  private cellPadding = 2;
  private cellBox: number;
  private textSize: number;
  private textOffsetY: number;
  private columns: SVGGridColumn[];
  private rowHeaders: string[];

  public constructor(options?: SVGGridBuilderOptions) {
    this.cellSize = options ? options.cellSize || this.cellSize : this.cellSize;
    this.cellPadding = options ? options.cellPadding || this.cellPadding : this.cellPadding;
    this.cellBox = this.cellSize + this.cellPadding;
    this.textSize = this.cellSize * 0.75;
    this.textOffsetY = this.cellSize * 0.25;
    this.columns = [];
    this.rowHeaders = [];
  }

  public addColumn(header: string): void {
    this.columns.push(new SVGGridColumn(this.cellBox * this.columns.length, this.cellSize, this.cellPadding, header));
  }

  public addRowHeaders(...args: string[]): void {
    for (const [idx, rowHeader] of args.entries()) {
      this.rowHeaders[idx] = rowHeader;
    }
  }

  public addRowHeader(yPosition: number, header: string): void {
    this.rowHeaders[yPosition] = header;
  }

  public addCell(x: number, color: string): void {
    this.columns[x].addCell(color);
  }

  public toString(): string {
    return `<svg width="${this.cellBox * (this.columns.length + 1) + 44}" height="${
      this.cellBox * Math.max(...this.columns.map((col) => col.length())) + 20
    }"><g transform="translate(44, 20)">${this.columns
      .map((column) => column.toString())
      .join('')}</g><g transform="translate(40, ${20 + this.cellSize})">${this.rowHeaders
      .map(
        (rowHeader, index) =>
          `<text font-size="${this.textSize}" font-family="sans-serif" text-anchor="end" x="0" y="${
            index * this.cellBox - this.textOffsetY
          }">${rowHeader ? rowHeader : ''}</text>`,
      )
      .join('')}</g></svg>`;
  }
}

export default SVGGridBuilder;
