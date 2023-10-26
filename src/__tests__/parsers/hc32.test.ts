import { HC32Parser } from '../../parsers/hc32';
import { cleanupAndSplitCrashLog } from '../../parsers';

const parser = new HC32Parser();

describe('canParse', () => {
  test('should return true for a HC32 crash log', async () => {
    const crashLogText = `
        *** HARDFAULT ***
        - FSR / FAR:
        SCB->HFSR = 0x40000000
        SCB->CFSR = 0x02000000
        SCB->DFSR = 0x00000000
        SCB->AFSR = 0x00000000
        - Usage fault:
         * DIVBYZERO
        - Stack frame:
        R0 = 0x00000002
        R1 = 0x1fff8c0c
        R2 = 0x00000000
        R3 = 0x000001c4
        R12 = 0x7fffffff
        LR = 0x1fff848c
        PC = 0x0001af4a
        PSR = 0x61000000
        - Misc:
        LR = 0xfffffff9
        ***
        `;

    const crashLogLines = cleanupAndSplitCrashLog(crashLogText);

    expect(await parser.canParse(crashLogLines)).toBeTruthy();
  });

  test('should return false for a marlin crash log', async () => {
    const crashLogText = `
        ## Software Fault detected ##
        Cause: Hard
        R0   : 0x00000002
        R1   : 0x1FFF8B31
        R2   : 0x00000000
        R3   : 0x000001C4
        R12  : 0x7FFFFFFF
        LR   : 0x1FFF8494
        PC   : 0x0001C7B2
        PSR  : 0x61000000
        CFSR : 0x02000000
        HFSR : 0x40000000
        DFSR : 0x00000000
        AFSR : 0x00000000
        MMAR : 0xE000ED34
        BFAR : 0xE000ED38
        ExcLR: 0xFFFFFFF9
        ExcSP: 0x1FFFB158
        Backtrace:#1 : unknown@0x0001C39C+1046 PC:0x0001C7B2
        #2 : unknown@0x0001BA20+1746 PC:0x0001C0F2
        #3 : unknown@0x0001E4B4+102 PC:0x0001E51A
        #4 : unknown@0x000172A4+88 PC:0x000172FC
        #5 : unknown@0x00013E5C+38 PC:0x00013E82
        #6 : unknown@0x0001293C+128 PC:0x000129BC
        `;

    const crashLogLines = cleanupAndSplitCrashLog(crashLogText);

    expect(await parser.canParse(crashLogLines)).toBeFalsy();
  });
});

describe('parse', () => {
  test('should parse crash log', async () => {
    const crashLogText = `
          *** HARDFAULT ***
          - FSR / FAR:
          SCB->HFSR = 0x40000000
          SCB->CFSR = 0x02000000
          SCB->DFSR = 0x00000000
          SCB->AFSR = 0x00000000
          - Usage fault:
           * DIVBYZERO
          - Stack frame:
          R0 = 0x00000002
          R1 = 0x1fff8c0c
          R2 = 0x00000000
          R3 = 0x000001c4
          R12 = 0x7fffffff
          LR = 0x1fff848c
          PC = 0x0001af4a
          PSR = 0x61000000
          - Misc:
          LR = 0xfffffff9
          ***
          `;

    const crashLogLines = cleanupAndSplitCrashLog(crashLogText);

    const crashLog = await parser.parse(crashLogLines);

    expect(crashLog.registers).toEqual({
      R0: 0x00000002,
      R1: 0x1fff8c0c,
      R2: 0x00000000,
      R3: 0x000001c4,
      R12: 0x7fffffff,
      LR: 0x1fff848c,
      PC: 0x0001af4a,
      PSR: 0x61000000,
      HFSR: 0x40000000,
      CFSR: 0x02000000,
      DFSR: 0x00000000,
      AFSR: 0x00000000,
    });

    expect(crashLog.backtrace).toEqual([]);
  });
});
