import { parse } from '../../registers/hfsr';

//
// HFSR
//
const HFSR_OFFSET = 0;
const HFSR_FLAG = (bit: number) => 1 << (bit + HFSR_OFFSET);
const DEBUGEVT = HFSR_FLAG(31);
const FORCED = HFSR_FLAG(30);
const VECTBL = HFSR_FLAG(1);

describe('parse HFSR single flags', () => {
  test('DEBUGEVT', () => {
    expect(parse(DEBUGEVT)).toContain('DEBUGEVT');
  });

  test('FORCED', () => {
    expect(parse(FORCED)).toContain('FORCED');
  });

  test('VECTBL', () => {
    expect(parse(VECTBL)).toContain('VECTBL');
  });
});

describe('parse HFSR multiple flags', () => {
  test('DEBUGEVT | FORCED', () => {
    expect(parse(DEBUGEVT | FORCED)).toContain('DEBUGEVT');
    expect(parse(DEBUGEVT | FORCED)).toContain('FORCED');
  });

  test('DEBUGEVT | FORCED | VECTBL', () => {
    expect(parse(DEBUGEVT | FORCED | VECTBL)).toContain('DEBUGEVT');
    expect(parse(DEBUGEVT | FORCED | VECTBL)).toContain('FORCED');
    expect(parse(DEBUGEVT | FORCED | VECTBL)).toContain('VECTBL');
  });
});
