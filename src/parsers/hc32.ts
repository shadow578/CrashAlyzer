import { BacktraceItem, CrashLog, CrashLogParser, CrashLogRegisters } from './base';

/**
 * crashlog parser for framework-arduino-hc32f46x's HardFault_Handler
 *
 * @example
 * *** HARDFAULT ***
 * - FSR / FAR:
 * SCB->HFSR = 0x40000000
 * SCB->CFSR = 0x02000000
 * SCB->DFSR = 0x00000000
 * SCB->AFSR = 0x00000000
 * - Usage fault:
 *  * DIVBYZERO
 * - Stack frame:
 * R0 = 0x00000002
 * R1 = 0x1fff8c0c
 * R2 = 0x00000000
 * R3 = 0x000001c4
 * R12 = 0x7fffffff
 * LR = 0x1fff848c
 * PC = 0x0001af4a
 * PSR = 0x61000000
 * - Misc:
 * LR = 0xfffffff9
 * ***
 *
 *
 * !!
 */
export class HC32Parser extends CrashLogParser {
  public get name(): string {
    return 'hc32';
  }

  public get backtraceSupported(): boolean {
    // HC32 does not output a backtrace
    return false;
  }

  public async canParse(crashLogLines: string[]): Promise<boolean> {
    // HC32 begins the crash log with "*** HARDFAULT ***"
    return crashLogLines[0].startsWith('*** HARDFAULT ***');
  }

  public async parse(crashLogLines: string[]): Promise<CrashLog> {
    let registers: CrashLogRegisters = {};

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
    });

    return {
      registers,
      backtrace: [],
    };
  }

  private parseRegisterLine(line: string): Partial<CrashLogRegisters> | undefined {
    // parse register dump line
    // R0 = 0x00000002
    // R12 = 0x7fffffff
    // SCB->HFSR = 0x40000000
    const pattern = /^((?:SCB->)?[A-Za-z0-9]+)\s+=\s+0x([0-9A-Fa-f]+)$/;
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

      // some register names are prefixed with 'SCB->'
      'SCB->CFSR': 'CFSR',
      'SCB->HFSR': 'HFSR',
      'SCB->DFSR': 'DFSR',
      'SCB->AFSR': 'AFSR',

      // MMAR and BFAR are only printed if they are valid
      'SCB->MMAR': 'MMAR',
      'SCB->BFAR': 'BFAR',
    };

    // check if the register name is known
    const registerName = registersMap[name];
    if (!registerName) {
      return;
    }

    // check if the register value is a number
    if (isNaN(value)) {
      console.error(`Failed to parse register value: ${match[2]} (line: ${line})`);
      return;
      //throw new Error(`Failed to parse register value: ${match[2]} (line: ${line})`);
    }

    return {
      [registerName]: value,
    };
  }
}
