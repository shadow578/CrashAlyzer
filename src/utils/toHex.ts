declare module 'util' {
  // add toHex() function to numbers
  global {
    interface Number {
      toHex(minBytes?: number): string;
    }
  }
}

Number.prototype.toHex = function (minBytes = 0) {
  return '0x' + this.toString(16).padStart(minBytes * 2, '0');
};
