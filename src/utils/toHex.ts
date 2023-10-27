declare module 'util' {
  // add toHex() function to numbers
  global {
    interface Number {
      /**
       * convert a number to a hex string
       *
       * @param padToBits pad the hex string to this many bits
       * @returns the hex string in lowercase, with a leading '0x'
       */
      toHex(padToBits?: number): string;
    }
  }
}

Number.prototype.toHex = function (padToBits = 0) {
  return (
    '0x' +
    this.toString(16)
      .padStart(Math.floor(padToBits / 4), '0')
      .toLowerCase()
  );
};
