import { parse } from '../../registers/psr';

//
// APSR
//
const APSR_OFFSET = 0;
const APSR_FLAG = (bit: number) => 1 << (bit + APSR_OFFSET);
const N = APSR_FLAG(31);
const Z = APSR_FLAG(30);
const C = APSR_FLAG(29);
const V = APSR_FLAG(28);
const Q = APSR_FLAG(27);

//
// IPSR
//
const IPSR_MASK = 0x0000_00ff;
const IPSR_VALUE = (value: number) => value & IPSR_MASK;

describe('parse APSR single flags', () => {
  test('N', () => {
    expect(parse(N).APSR).toContain('N');
  });

  test('Z', () => {
    expect(parse(Z).APSR).toContain('Z');
  });

  test('C', () => {
    expect(parse(C).APSR).toContain('C');
  });

  test('V', () => {
    expect(parse(V).APSR).toContain('V');
  });

  test('Q', () => {
    expect(parse(Q).APSR).toContain('Q');
  });
});

describe('parse APSR multiple flags', () => {
  test('N | Z', () => {
    expect(parse(N | Z).APSR).toContain('N');
    expect(parse(N | Z).APSR).toContain('Z');
  });

  test('N | Z | C', () => {
    expect(parse(N | Z | C).APSR).toContain('N');
    expect(parse(N | Z | C).APSR).toContain('Z');
    expect(parse(N | Z | C).APSR).toContain('C');
  });

  test('N | Z + IPSR = 25', () => {
    expect(parse(N | Z | IPSR_VALUE(25)).APSR).toContain('N');
    expect(parse(N | Z | IPSR_VALUE(25)).APSR).toContain('Z');
  });
});

describe('parse IPSR', () => {
  test('IPSR = 0', () => {
    expect(parse(IPSR_VALUE(0))).toHaveProperty('IPSR', 0);
  });

  test('IPSR = 46', () => {
    expect(parse(IPSR_VALUE(46))).toHaveProperty('IPSR', 46);
  });

  test('IPSR = 25, APSR flags set', () => {
    expect(parse(IPSR_VALUE(25) | N | Z | C)).toHaveProperty('IPSR', 25);
  });
});
