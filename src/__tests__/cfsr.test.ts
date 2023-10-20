import { parseCFSR } from '../cfsr';

//
// MMFSR
//
const MMFSR_OFFSET = 0;
const MMFSR_FLAG = (bit: number) => 1 << (bit + MMFSR_OFFSET);
const MMARVALID = MMFSR_FLAG(7);
const MLSPERR = MMFSR_FLAG(5);
const MSTKERR = MMFSR_FLAG(4);
const MUNSTKERR = MMFSR_FLAG(3);
const DACCVIOL = MMFSR_FLAG(1);
const IACCVIOL = MMFSR_FLAG(0);

//
// BFSR
//
const BFSR_OFFSET = 8;
const BFSR_FLAG = (bit: number) => 1 << (bit + BFSR_OFFSET);
const BFARVALID = BFSR_FLAG(7);
const LSPERR = BFSR_FLAG(5);
const STKERR = BFSR_FLAG(4);
const UNSTKERR = BFSR_FLAG(3);
const IMPRECISERR = BFSR_FLAG(2);
const PRECISERR = BFSR_FLAG(1);
const IBUSERR = BFSR_FLAG(0);

//
// UFSR
//
const UFSR_OFFSET = 16;
const UFSR_FLAG = (bit: number) => 1 << (bit + UFSR_OFFSET);
const DIVBYZERO = UFSR_FLAG(9);
const UNALIGNED = UFSR_FLAG(8);
const NOCP = UFSR_FLAG(3);
const INVPC = UFSR_FLAG(2);
const INVSTATE = UFSR_FLAG(1);
const UNDEFINSTR = UFSR_FLAG(0);

test('test harness sanity check', () => {
  // check some flag values
  expect(DIVBYZERO).toBe(0x0200_0000);
  expect(UNALIGNED).toBe(0x0100_0000);

  expect(BFARVALID).toBe(0x0000_8000);
  expect(STKERR).toBe(0x0000_1000);

  expect(MMARVALID).toBe(0x0000_0080);
  expect(MSTKERR).toBe(0x0000_0010);

  // check bitwise or is working
  expect(DIVBYZERO | UNALIGNED).toBe(0x0300_0000);
});

describe('parseCFSR MMFSR single flags', () => {
  test('MMARVALID', () => {
    expect(parseCFSR(MMARVALID)).toContain('MMARVALID');
  });

  test('MLSPERR', () => {
    expect(parseCFSR(MLSPERR)).toContain('MLSPERR');
  });

  test('MSTKERR', () => {
    expect(parseCFSR(MSTKERR)).toContain('MSTKERR');
  });

  test('MUNSTKERR', () => {
    expect(parseCFSR(MUNSTKERR)).toContain('MUNSTKERR');
  });

  test('DACCVIOL', () => {
    expect(parseCFSR(DACCVIOL)).toContain('DACCVIOL');
  });

  test('IACCVIOL', () => {
    expect(parseCFSR(IACCVIOL)).toContain('IACCVIOL');
  });
});

describe('parseCFSR BFSR single flags', () => {
  test('BFARVALID', () => {
    expect(parseCFSR(BFARVALID)).toContain('BFARVALID');
  });

  test('LSPERR', () => {
    expect(parseCFSR(LSPERR)).toContain('LSPERR');
  });

  test('STKERR', () => {
    expect(parseCFSR(STKERR)).toContain('STKERR');
  });

  test('UNSTKERR', () => {
    expect(parseCFSR(UNSTKERR)).toContain('UNSTKERR');
  });

  test('IMPRECISERR', () => {
    expect(parseCFSR(IMPRECISERR)).toContain('IMPRECISERR');
  });

  test('PRECISERR', () => {
    expect(parseCFSR(PRECISERR)).toContain('PRECISERR');
  });

  test('IBUSERR', () => {
    expect(parseCFSR(IBUSERR)).toContain('IBUSERR');
  });
});

describe('parseCFSR UFSR single flags', () => {
  test('DIVBYZERO', () => {
    expect(parseCFSR(DIVBYZERO)).toContain('DIVBYZERO');
  });

  test('UNALIGNED', () => {
    expect(parseCFSR(UNALIGNED)).toContain('UNALIGNED');
  });

  test('NOCP', () => {
    expect(parseCFSR(NOCP)).toContain('NOCP');
  });

  test('INVPC', () => {
    expect(parseCFSR(INVPC)).toContain('INVPC');
  });

  test('INVSTATE', () => {
    expect(parseCFSR(INVSTATE)).toContain('INVSTATE');
  });

  test('UNDEFINSTR', () => {
    expect(parseCFSR(UNDEFINSTR)).toContain('UNDEFINSTR');
  });
});

describe('parseCFSR multiple flags', () => {
  test('MMARVALID | DIVBYZERO', () => {
    expect(parseCFSR(MMARVALID | DIVBYZERO)).toContain('MMARVALID');
    expect(parseCFSR(MMARVALID | DIVBYZERO)).toContain('DIVBYZERO');
  });

  test('MLSPERR | UNALIGNED', () => {
    expect(parseCFSR(MLSPERR | UNALIGNED)).toContain('MLSPERR');
    expect(parseCFSR(MLSPERR | UNALIGNED)).toContain('UNALIGNED');
  });
});
