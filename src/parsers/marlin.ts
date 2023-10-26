import { BacktraceItem, CrashLog, CrashLogParser, CrashLogRegisters } from './base';

/**
 * crashlog parser for Marlin's POSTMORTEM_DEBUGGING feature
 *
 * @example
 * ## Software Fault detected ##
 * Cause: Hard
 * R0   : 0x00000002
 * R1   : 0x1FFF8B31
 * R2   : 0x00000000
 * R3   : 0x000001C4
 * R12  : 0x7FFFFFFF
 * LR   : 0x1FFF8494
 * PC   : 0x0001C7B2
 * PSR  : 0x61000000
 * CFSR : 0x02000000
 * HFSR : 0x40000000
 * DFSR : 0x00000000
 * AFSR : 0x00000000
 * MMAR : 0xE000ED34
 * BFAR : 0xE000ED38
 * ExcLR: 0xFFFFFFF9
 * ExcSP: 0x1FFFB158
 * Backtrace:#1 : unknown@0x0001C39C+1046 PC:0x0001C7B2
 * #2 : unknown@0x0001BA20+1746 PC:0x0001C0F2
 * #3 : unknown@0x0001E4B4+102 PC:0x0001E51A
 * #4 : unknown@0x000172A4+88 PC:0x000172FC
 * #5 : unknown@0x00013E5C+38 PC:0x00013E82
 * #6 : unknown@0x0001293C+128 PC:0x000129BC
 */
export class MarlinParser extends CrashLogParser {
  public get name(): string {
    return 'marlin';
  }

  public get backtraceSupported(): boolean {
    return true;
  }

  public async canParse(crashLogLines: string[]): Promise<boolean> {
    // marlin begins the crash log with "## Software Fault detected ##"
    return crashLogLines[0].startsWith('## Software Fault detected ##');
  }

  public async parse(crashLogLines: string[]): Promise<CrashLog> {
    let registers: CrashLogRegisters = {};
    const backtrace: BacktraceItem[] = [];

    // parse line-by-line
    crashLogLines.forEach((line) => {
      const register = this.parseRegisterLine(line);
      if (register) {
        registers = {
          // if the parsed register already exists in registers, it will not be overwritten
          ...register,
          ...registers,
        };
      }

      const backtraceItem = this.parseBacktraceLine(line);
      if (backtraceItem) {
        backtrace.push(backtraceItem);
      }
    });

    return {
      registers,
      backtrace,
    };
  }

  private parseRegisterLine(line: string): Partial<CrashLogRegisters> | undefined {
    // parse register dump line
    // R0   : 0x00000001
    // CFSR : 0x00000000
    const pattern = /^([A-Za-z0-9]+)\s*:\s+0x([0-9A-Fa-f]+)$/;
    const match = pattern.exec(line);
    if (!match) {
      return;
    }

    const name = match[1];
    const value = parseInt(match[2], 16);

    // map of register name strings in crash log to register names in CrashLogRegisters
    const registersMap: Record<typeof name, keyof CrashLogRegisters> = {
      R0: 'R0',
      R1: 'R1',
      R2: 'R2',
      R3: 'R3',
      R12: 'R12',
      LR: 'LR',
      PC: 'PC',
      PSR: 'PSR',
      CFSR: 'CFSR',
      HFSR: 'HFSR',
      DFSR: 'DFSR',
      AFSR: 'AFSR',
      MMAR: 'MMAR',
      BFAR: 'BFAR',
      ExcLR: 'ExcLR',
      ExcSP: 'ExcSP',
    };

    // check if the register name is known
    const registerName = registersMap[name];
    if (!registerName) {
      return;
    }

    // check if the register value is a number
    if (isNaN(value)) {
      throw new Error(`Failed to parse register value: ${match[2]} (line: ${line})`);
    }

    return {
      [registerName]: value,
    };
  }

  private parseBacktraceLine(line: string): BacktraceItem | undefined {
    // check if the line contains a backtrace entry
    // #<position> : <name>@<address>+<offset> PC:<address>
    // #1 : unknown@0x0001C38C+182 PC:0x0001C442
    const pattern = /#(\d+) : ([^@]+)@0x([0-9A-Fa-f]+)\+(\d+) PC:0x([0-9A-Fa-f]+)/;
    const match = pattern.exec(line);
    if (!match) {
      return;
    }

    let functionName: string | undefined = match[2];
    const baseAddress = parseInt(match[3], 16); // HEX
    const instructionOffset = parseInt(match[4], 10); // DEC
    const pc = parseInt(match[5], 16); // HEX

    // set functionName to undefined if it is "unknown"
    if (functionName === 'unknown') {
      functionName = undefined;
    }

    // check baseAddress and instructionOffset are not NaN
    const hasFunction = !isNaN(baseAddress) && !isNaN(instructionOffset);

    // ensure PC is not NaN
    if (isNaN(pc)) {
      throw new Error(`Failed to parse PC address: ${match[5]} (line: ${line})`);
    }
    return {
      function: hasFunction
        ? {
            name: functionName,
            baseAddress,
            instructionOffset,
          }
        : undefined,
      PC: pc,
    };
  }
}
