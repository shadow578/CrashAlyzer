import PARSERS, { CrashLogParser, CrashLogRegisters, BackTrace, cleanupAndSplitCrashLog } from './parsers';
import { TablePrinter } from './ui/table';
import { addr2line as invokeAddr2line, Addr2LineResult, setAddr2LinePath, addr2lineAvailable } from './addr2line';
import * as CFSR from './registers/cfsr';
import * as HFSR from './registers/hfsr';
import * as PSR from './registers/psr';
import chalk from 'chalk';
import './utils/toHex';
import * as fs from 'fs';

/**
 * arguments for processAndPrintCrashLog()
 */
export interface ProcessingArgs {
  /**
   * raw crash log string to process
   */
  crashLog: string;

  /**
   * path to the firmware ELF file
   */
  elfPath: string;

  /**
   * path to the addr2line executable
   */
  addr2linePath: string;
}

/**
 * check if all required fields of the processing args are populated
 *
 * @param args the args to check
 * @returns are the args populated?
 */
export function processingArgsPopulated(args: Partial<ProcessingArgs>): args is ProcessingArgs {
  return (
    typeof args.crashLog === 'string' && typeof args.elfPath === 'string' && typeof args.addr2linePath === 'string'
  );
}

/**
 * process the user input and print crash log information to the console
 *
 * @param options processing options
 */
export async function processAndPrintCrashLog(options: ProcessingArgs) {
  // set global addr2line path and test
  setAddr2LinePath(options.addr2linePath);
  if (!addr2lineAvailable()) {
    console.log(chalk.red('addr2line was not found at the specified path! please check your input.'));
    return;
  }

  // set global elf path and test
  elfPath = options.elfPath;
  if (!fs.existsSync(elfPath)) {
    console.log(chalk.red('the firmware.ELF was not found at the specified path! please check your input.'));
    return;
  }

  // split crash log into lines
  const crashLogLines = cleanupAndSplitCrashLog(options.crashLog);

  // find the right parser for the crash log
  let parser: CrashLogParser | undefined = undefined;
  let startIndex: number | undefined = undefined;
  for (const p of PARSERS) {
    const { index, canParse } = await p.findStartIndex(crashLogLines);
    if (canParse) {
      parser = p;
      startIndex = index;
      break;
    }
  }

  if (!parser || startIndex === undefined) {
    console.log(chalk.red('no parser found for the provided crash log! is it supported?'));
    return;
  }

  console.log(chalk.green('Using parser:'), chalk.blue(parser.name));

  // skip lines before the crash log
  console.log(chalk.green('Skipping first'), chalk.blue(startIndex.toString()), chalk.green('lines in crash log'));
  crashLogLines.splice(0, startIndex);

  // parse the crash log
  const crashLog = await parser.parse(crashLogLines);

  // output crash log to console:

  // registers
  console.log();
  console.log(chalk.blue('Registers:'));
  console.log(
    chalk.white(
      (await formatRegisters(crashLog.registers)).toString({
        cellSeparator: '  ',
        printHeaderSeparator: false,
      }),
    ),
  );

  // backtrace
  if (parser.backtraceSupported) {
    console.log();
    console.log(chalk.blue('Backtrace:'));
    if (crashLog.backtrace.length > 0) {
      console.log(chalk.white((await formatBacktrace(crashLog.backtrace)).toString()));
    } else {
      console.log(chalk.yellow('No backtrace found'));
    }
  }

  // CFSR help text
  if (crashLog.registers.CFSR !== 0) {
    console.log();
    console.log(
      chalk.cyan('For more information on how to interpret the CFSR flags, see: '),
      // links to the CFSR spec and some blog posts about it
      ...[
        'https://interrupt.memfault.com/blog/cortex-m-fault-debug',
        'https://developer.arm.com/documentation/dui0552/a/cortex-m3-peripherals/system-control-block/configurable-fault-status-register',
        'https://developer.arm.com/documentation/dui0553/a/the-cortex-m4-processor/exception-model/fault-reporting/cfsr---configurable-fault-status-register',
      ].flatMap((link) => [chalk.cyan('\n -'), chalk.blue(chalk.underline(link))]),
    );
  }
}

// #region addr2line wrapper

/**
 * global path to the firmware ELF file, used by addr2line()
 */
let elfPath: string;

/**
 * wrapper around addr2line
 */
async function addr2line(address: number): Promise<Addr2LineResult | undefined> {
  try {
    return await invokeAddr2line(elfPath, address);
  } catch (_error) {
    return;
  }
}

// #endregion

// #region register formatting

const CFSRFlagDocs: Record<CFSR.CFSRFaultFlag, string> = {
  // MemFault
  MMARVALID: 'Memory Management Fault Address Register (MMAR) is valid',
  MLSPERR: 'Memory Management Fault occurred during floating-point lazy state preservation',
  MSTKERR: 'Memory Management Fault occurred during exception stacking',
  MUNSTKERR: 'Memory Management Fault occurred during exception unstacking',
  DACCVIOL: 'Data Access Violation',
  IACCVIOL: 'Instruction Access Violation',

  // BusFault
  BFARVALID: 'Bus Fault Address Register (BFAR) is valid',
  LSPERR: 'Bus Fault occurred during floating-point lazy state preservation',
  STKERR: 'Bus Fault occurred during exception stacking',
  UNSTKERR: 'Bus Fault occurred during exception unstacking',
  IMPRECISERR: 'Imprecise Data Access Error',
  PRECISERR: 'Precise Data Access Error',
  IBUSERR: 'Instruction Bus Error',

  // UsageFault
  DIVBYZERO: 'Division By Zero',
  UNALIGNED: 'Unaligned Access',
  NOCP: 'No Coprocessor',
  INVPC: 'Invalid PC Load',
  INVSTATE: 'Invalid State',
  UNDEFINSTR: 'Undefined Instruction',
};

const HFSRFlagDocs: Record<HFSR.HFSRFaultFlag, string> = {
  DEBUGEVT: 'Debug Event',
  FORCED: 'Forced Hard Fault',
  VECTBL: 'Vector Table Hard Fault',
};

const APSRFlagDocs: Record<PSR.APSRFlag, string> = {
  N: 'Negative Condition Flag',
  Z: 'Zero Condition Flag',
  C: 'Carry Condition Flag',
  V: 'Overflow Condition Flag',
  Q: 'Cumulative saturation flag',
};

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
    CFSR.parse(value).forEach((flag) => {
      tbl
        .commitRow() // finish previous row
        .pushColumn('') // empty column for alignment
        .pushColumn(`- ${flag}: ${CFSRFlagDocs[flag]}`, 0); // flag name and doc, width=0 to bypass table formatting

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
  HFSR: async (tbl, value) => {
    HFSR.parse(value).forEach((flag) => {
      tbl
        .commitRow() // finish previous row
        .pushColumn('') // empty column for alignment
        .pushColumn(`- ${flag}: ${HFSRFlagDocs[flag]}`, 0); // flag name and doc, width=0 to bypass table formatting
    });
  },
  PSR: async (tbl, value) => {
    const psr = PSR.parse(value);

    // IPSR:
    tbl
      .commitRow() // finish previous row
      .pushColumn('') // empty column for alignment
      .pushColumn(`- IPSR: ${psr.IPSR}`, 0); // flag name and doc, width=0 to bypass table formatting

    // APSR:
    psr.APSR.forEach((flag) => {
      tbl
        .commitRow() // finish previous row
        .pushColumn('') // empty column for alignment
        .pushColumn(`- ${flag}: ${APSRFlagDocs[flag]}`, 0); // flag name and doc, width=0 to bypass table formatting
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
    // push register name and value as 32-bit hex
    tbl.pushColumn(name).pushColumn(value.toHex(32));

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

    const functionPlusOffset = `${item.function?.baseAddress.toHex(32) ?? '??'}+${
      item.function?.instructionOffset ?? '??'
    }`;
    const functionName = a2l ? a2l.functionName : item.function?.name ?? '??';
    const filePlusLine = a2l ? `${a2l.file.name}:${a2l.line}` : '??:?';
    tbl
      .pushColumn(i.toString()) // #
      .pushColumn(`${item.PC.toHex(32)} (${functionPlusOffset})`) // address, 32-bit hex; function base + offset
      .pushColumn(functionName) // function name
      .pushColumn(filePlusLine) // file:line
      .commitRow();
  }

  return tbl;
}

// #endregion
