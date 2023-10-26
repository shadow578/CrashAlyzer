import PARSERS, { CrashLogParser, CrashLog, CrashLogRegisters, BacktraceItem, BackTrace } from './parsers';
import { TablePrinter } from './ui/table';
import { addr2line as invokeAddr2line, Addr2LineResult, setAddr2LinePath } from './addr2line';
import * as CFSR from './cfsr';

// add toHex() function to numbers
declare global {
  interface Number {
    toHex(minBytes?: number): string;
  }
}
Number.prototype.toHex = function (minBytes = 0) {
  return '0x' + this.toString(16).padStart(minBytes * 2, '0');
};

let elfPath: string;

async function main() {
  //TODO read args / user input
  const addr2linePath = 'arm-none-eabi-addr2line';
  setAddr2LinePath(addr2linePath);
  elfPath = './firmware.elf';
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

  // split crash log into lines
  const crashLogLines = cleanupAndSplitCrashLog(crashLogText);

  // find the right parser for the crash log
  let parser: CrashLogParser | undefined = undefined;
  for (const p of PARSERS) {
    if (await p.canParse(crashLogLines)) {
      parser = p;
      break;
    }
  }

  if (!parser) {
    throw new Error('No parser found for the given crash log');
  }
  console.log(`Using parser: ${parser.name}`);

  // parse the crash log
  const crashLog = await parser.parse(crashLogLines);

  // output crash log to console:

  // registers
  console.log('Registers: ');
  console.log((await formatRegisters(crashLog.registers)).toString());

  // CFSR help text
  if (crashLog.registers.CFSR !== 0) {
    console.log(`for details on CFSR flags, see
      - https://developer.arm.com/documentation/dui0552/a/cortex-m3-peripherals/system-control-block/configurable-fault-status-register?lang=en
      - https://developer.arm.com/documentation/dui0553/a/the-cortex-m4-processor/exception-model/fault-reporting/cfsr---configurable-fault-status-register
       `);
  }

  // backtrace
  console.log();
  console.log('Backtrace: ');
  console.log((await formatBacktrace(crashLog.backtrace)).toString());
}
main();

// #region utils

/**
 * clean up crash log and split into lines
 *
 * @param crashLog the crash log to cleanup
 * @returns the cleaned up crash log lines
 */
function cleanupAndSplitCrashLog(crashLog: string): string[] {
  return crashLog
    .split(/\r?\n/) // split into lines
    .map((line) => line.trim()) // trim whitespace
    .map((line) => line.replace(/^recv:/i, '')) // remove 'Recv:' prefix (OctoPrint terminal)
    .map((line) => line.trim()) // trim whitespace again
    .filter((line) => line.length > 0); // remove empty lines
}

/**
 * wrapper around addr2line
 */
async function addr2line(address: number): Promise<Addr2LineResult | undefined> {
  try {
    return await invokeAddr2line(elfPath, address);
  } catch (error) {
    return;
  }
}

// #endregion

// #region register formatting

/**
 * custom formatter functions for registers.
 * @param tbl table writer to push formatted values to.
 *            current row already contains the register name and value.
 *            .commitRow() will be called after the formatter returns
 * @param value the register value
 * @param registers all registers
 */
type RegisterFormatter = (tbl: TablePrinter, value: number, registers: CrashLogRegisters) => Promise<void>;
const registerFormatters: Partial<Record<keyof CrashLogRegisters, RegisterFormatter>> = {
  LR: async (tbl, value) => {
    // lookup addr2line info for LR
    const a2l = await addr2line(value);
    if (a2l) {
      tbl
        .pushColumn(a2l.functionName) // function name
        .pushColumn(`${a2l.file.name}:${a2l.line}`); // file:line
    }
  },
  PC: async (tbl, value) => {
    // lookup addr2line info for PC
    const a2l = await addr2line(value);
    if (a2l) {
      tbl
        .pushColumn(a2l.functionName) // function name
        .pushColumn(`${a2l.file.name}:${a2l.line}`); // file:line
    }
  },
  CFSR: async (tbl, value, registers) => {
    CFSR.parseCFSR(value).forEach((flag) => {
      tbl
        .commitRow() // finish previous row
        .pushColumn('') // empty column for alignment
        .pushColumn(`- ${flag}`); // flag name

      // handle MMARVALID flag
      if (flag === 'MMARVALID' && registers.MMAR) {
        tbl.pushColumn(`MMAR: ${registers.MMAR.toHex()}`);
      }

      // handle BFARVALID flag
      if (flag === 'BFARVALID' && registers.BFAR) {
        tbl.pushColumn(`BFAR: ${registers.BFAR.toHex()}`);
      }
    });
  },
};

/**
 * format registers into a table
 *
 * @param registers registers to format
 * @returns table containing formatted registers
 */
async function formatRegisters(registers: CrashLogRegisters): Promise<TablePrinter> {
  const tbl = new TablePrinter();

  tbl.pushColumn('Register').pushColumn('Value').commitRow();

  for (const [name, value] of Object.entries(registers)) {
    // push register name and value as 32-bit (4 byte) hex
    tbl.pushColumn(name).pushColumn(value.toHex(4));

    // append extra info if available
    const formatter = registerFormatters[name as keyof CrashLogRegisters];
    if (formatter) {
      await formatter(tbl, value, registers);
    }

    // commit row
    tbl.commitRow();
  }

  return tbl;
}

// #endregion

// #region backtrace formatting

/**
 * format backtrace into a table
 *
 * @param backtrace the backtrace to format
 * @returns table containing formatted backtrace
 */
async function formatBacktrace(backtrace: BackTrace): Promise<TablePrinter> {
  const tbl = new TablePrinter();

  tbl
    .pushColumn('#')
    .pushColumn('Address (Function+Offset)')
    .pushColumn('Function')
    .pushColumn('File:Line')
    .commitRow();

  for (const [i, item] of backtrace.map((item, i) => [i, item] as const)) {
    const a2l = await addr2line(item.PC);

    const functionPlusOffset = `${item.function?.baseAddress.toHex(4) ?? '??'}+${item.function?.instructionOffset ?? '??'}`;
    const functionName = a2l ? a2l.functionName : item.function?.name ?? '??';
    const filePlusLine = a2l ? `${a2l.file.name}:${a2l.line}` : '??:?';
    tbl
      .pushColumn(i.toString()) // #
      .pushColumn(`${item.PC.toHex(4)} (${functionPlusOffset})`) // address, 32-bit (4 byte) hex; function base + offset
      .pushColumn(functionName) // function name
      .pushColumn(filePlusLine) // file:line
      .commitRow();
  }

  return tbl;
}

// #endregion
