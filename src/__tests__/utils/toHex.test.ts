import '../../utils/toHex';

describe('toHex', () => {
  test('toHex should be defined on numbers', () => {
    expect((0).toHex).toBeDefined();
    expect((1).toHex).toBeDefined();
    expect((2).toHex).toBeDefined();
    expect((3).toHex).toBeDefined();
  });

  test("toHex should return '0x0' for 0", () => {
    expect((0).toHex()).toBe('0x0');
  });

  test("toHex should return '0x1' for 1", () => {
    expect((1).toHex()).toBe('0x1');
  });

  test("toHex should return '0xa' for 10", () => {
    expect((10).toHex().toLowerCase()).toBe('0xa');
  });

  test("toHex should return '0xff' for 255", () => {
    expect((255).toHex()).toBe('0xff');
  });

  test("toHex with padToBits=8 should return '0x00' for 0", () => {
    expect((0).toHex(8)).toBe('0x00');
  });

  test("toHex with padToBits=32 should return '0x00000000' for 0", () => {
    expect((0).toHex(32)).toBe('0x00000000');
  });

  test("toHex with padToBits=32 should return '0x0000A001' for 0x0000A001", () => {
    expect((0x0000a001).toHex(32)).toBe('0x0000a001');
  });
});
