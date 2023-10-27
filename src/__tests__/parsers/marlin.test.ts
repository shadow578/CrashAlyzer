import { MarlinParser } from '../../parsers/marlin';
import { cleanupAndSplitCrashLog } from '../../parsers';

const parser = new MarlinParser();

describe('findStartIndex', () => {
  test('should find start for a marlin crash log', async () => {
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

    const result = await parser.findStartIndex(crashLogLines);
    expect(result).toHaveProperty('canParse', true);
    expect(result).toHaveProperty('index', 0);
  });

  test('should not find start for a HC32 crash log', async () => {
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

    const result = await parser.findStartIndex(crashLogLines);
    expect(result).toHaveProperty('canParse', false);
  });

  test('should find start for a marlin crash log', async () => {
    const crashLogText = `
        T:21.25 /0.00 B:21.25 /0.00 S:25.00 @:0 B@:0
        wait
        wait
         T:21.25 /0.00 B:21.25 /0.00 S:25.00 @:0 B@:0
        wait
        wait
         T:21.25 /0.00 B:21.25 /0.00 S:25.00 @:0 B@:0
        wait
        wait
         T:21.25 /0.00 B:21.25 /0.00 S:25.00 @:0 B@:0
        wait
        wait
         T:21.25 /0.00 B:21.25 /0.00 S:25.00 @:0 B@:0
        wait
        wait
         T:21.25 /0.00 B:21.25 /0.00 S:25.00 @:0 B@:0
        wait
        wait
         T:21.25 /0.00 B:21.25 /0.00 S:25.00 @:0 B@:0
        wait
        D451 T2
        Disabling heaters


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

    const result = await parser.findStartIndex(crashLogLines);
    expect(result).toHaveProperty('canParse', true);
    expect(result).toHaveProperty('index', 22); // empty lines are removed during cleanup
  });
});

describe('parse', () => {
  test('should parse crash log without backtrace', async () => {
    const crashLogText = `
            ## Software Fault detected ##
            Cause: Hard
            R0   : 0x00000005
            R1   : 0x1FBEF9F0
            R2   : 0x00000031
            R3   : 0x00004000
            R12  : 0x7FFFBEF0
            LR   : 0x1F4B9B9C
            PC   : 0x045E1C9A
            PSR  : 0x00000061
            CFSR : 0x020B0000
            HFSR : 0x40FA0000
            DFSR : 0x000CA000
            AFSR : 0x000AB000
            MMAR : 0xE0EDDE34
            BFAR : 0xE0DE3D38
            ExcLR: 0xFFFBEFF9
            ExcSP: 0x1FFABB58
            `;

    const crashLogLines = cleanupAndSplitCrashLog(crashLogText);

    const crashLog = await parser.parse(crashLogLines);

    expect(crashLog.registers).toEqual({
      R0: 0x00000005,
      R1: 0x1fbef9f0,
      R2: 0x00000031,
      R3: 0x00004000,
      R12: 0x7fffbef0,
      LR: 0x1f4b9b9c,
      PC: 0x045e1c9a,
      PSR: 0x00000061,
      CFSR: 0x020b0000,
      HFSR: 0x40fa0000,
      DFSR: 0x000ca000,
      AFSR: 0x000ab000,
      MMAR: 0xe0edde34,
      BFAR: 0xe0de3d38,
      ExcLR: 0xfffbeff9,
      ExcSP: 0x1ffabb58,
    });

    expect(crashLog.backtrace).toEqual([]);
  });

  test('should parse crash log with backtrace', async () => {
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

    const crashLog = await parser.parse(crashLogLines);

    expect(crashLog.registers).toEqual({
      R0: 0x00000002,
      R1: 0x1fff8b31,
      R2: 0x00000000,
      R3: 0x000001c4,
      R12: 0x7fffffff,
      LR: 0x1fff8494,
      PC: 0x0001c7b2,
      PSR: 0x61000000,
      CFSR: 0x02000000,
      HFSR: 0x40000000,
      DFSR: 0x00000000,
      AFSR: 0x00000000,
      MMAR: 0xe000ed34,
      BFAR: 0xe000ed38,
      ExcLR: 0xfffffff9,
      ExcSP: 0x1fffb158,
    });

    expect(crashLog.backtrace.length).toBe(6);

    expect(crashLog.backtrace[0]).toEqual({
      function: {
        name: undefined,
        baseAddress: 0x0001c39c,
        instructionOffset: 1046,
      },
      PC: 0x0001c7b2,
    });

    expect(crashLog.backtrace[1]).toEqual({
      function: {
        name: undefined,
        baseAddress: 0x0001ba20,
        instructionOffset: 1746,
      },
      PC: 0x0001c0f2,
    });

    expect(crashLog.backtrace[2]).toEqual({
      function: {
        name: undefined,
        baseAddress: 0x0001e4b4,
        instructionOffset: 102,
      },
      PC: 0x0001e51a,
    });

    expect(crashLog.backtrace[3]).toEqual({
      function: {
        name: undefined,
        baseAddress: 0x000172a4,
        instructionOffset: 88,
      },
      PC: 0x000172fc,
    });

    expect(crashLog.backtrace[4]).toEqual({
      function: {
        name: undefined,
        baseAddress: 0x00013e5c,
        instructionOffset: 38,
      },
      PC: 0x00013e82,
    });

    expect(crashLog.backtrace[5]).toEqual({
      function: {
        name: undefined,
        baseAddress: 0x0001293c,
        instructionOffset: 128,
      },
      PC: 0x000129bc,
    });
  });
});
