/**
 * single cell in a table
 */
interface Cell {
  /**
   * string value of the cell
   */
  value: string;

  /**
   * width of the cell
   */
  width: number;
}

/**
 * a table printer that can be used to print tables in the console
 */
export class TablePrinter {
  /**
   * array of rows, each row is an array of columns
   */
  private table: Cell[][] = [];

  /**
   * add a row to the table directly
   * @param row the row to add
   */
  public addRow(row: Cell[]) {
    this.table.push(row);
    return this;
  }

  /**
   * add a entire row of values to the table
   * column widths are fixed to value length
   *
   * @param row the row values to add
   */
  public pushRow(row: string[]) {
    this.addRow(row.map((value) => ({ value, width: value.length })));
    return this;
  }

  /**
   * current row being built using builder api
   */
  private currentRow: Cell[] = [];

  /**
   * push a column to the current row
   *
   * @param value the column to push
   * @param width the width of the column. defaults to the length of the value
   */
  public pushColumn(value: string, width?: number) {
    this.currentRow.push({
      value,
      width: width ?? value.length,
    });
    return this;
  }

  /**
   * push the currently built row to the table and start a new row
   */
  public commitRow() {
    this.addRow(this.currentRow);
    this.currentRow = [];
    return this;
  }

  public toString(
    options = {
      cellSeparator: '|',
      printHeaderSeparator: true,
    },
  ): string {
    // calculate column widths
    const columnWidths: number[] = [];
    this.table.forEach((row) => {
      row.forEach((cell, i) => {
        columnWidths[i] = Math.max(columnWidths[i] ?? 0, cell.width);
      });
    });

    // format and output lines
    const tbl = this.table.map((row) => {
      return row
        .map((cell, i) => {
          const len = columnWidths[i];
          const entry = cell.value;
          return entry.padEnd(len + 2, ' ');
        })
        .join(options.cellSeparator + ' ');
    });

    if (options.printHeaderSeparator) {
      tbl.splice(1, 0, columnWidths.map((width) => '-'.repeat(width + 2)).join(options.cellSeparator + '-'));
    }

    return tbl.join('\n');
  }
}
