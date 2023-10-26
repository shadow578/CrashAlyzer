import PARSERS, { CrashLogParser, CrashLogRegisters, BackTrace } from './parsers';
import { TablePrinter } from './ui/table';
import { addr2line as invokeAddr2line, Addr2LineResult, setAddr2LinePath } from './addr2line';
import * as CFSR from './cfsr';
import { prompt } from 'enquirer';
import * as fs from 'fs';
import * as chalk from 'chalk';
import { promisify } from 'util';
import { exec } from 'child_process';
const execAsync = promisify(exec);

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
  // get args from user
  const userInput = (await prompt([
    {
      type: 'input',
      name: 'crashLog',
      multiline: true,
      message: 'Crash Log',
      validate: validateCrashLog,
    },
    {
      type: 'input',
      name: 'elfPath',
      initial: './firmware.elf',
      message: 'Path to elf file',
      validate: validatePathExists,
    },
    {
      type: 'input',
      name: 'addr2linePath',
      initial: 'arm-none-eabi-addr2line',
      message: 'Path to addr2line',
      validate: validateAddr2Line,
    },
  ])) as {
    crashLog: string;
    elfPath: string;
    addr2linePath: string;
  };

  // set global addr2line path
  setAddr2LinePath(userInput.addr2linePath);

  // set global elf path
  elfPath = userInput.elfPath;

  // split crash log into lines
  const crashLogLines = cleanupAndSplitCrashLog(userInput.crashLog);

  // find the right parser for the crash log
  let parser: CrashLogParser | undefined = undefined;
  for (const p of PARSERS) {
    if (await p.canParse(crashLogLines)) {
      parser = p;
      break;
    }
  }

  if (!parser) {
    console.log(chalk.red('❌'), chalk.white("Couldn't find a parser for the given crash log"));
    return;
    //throw new Error('No parser found for the given crash log');
  }

  console.log(chalk.green('✔'), chalk.white('Using parser:'), chalk.blue(parser.name));

  // parse the crash log
  const crashLog = await parser.parse(crashLogLines);

  // output crash log to console:

  // registers
  console.log();
  console.log(chalk.green('📃'), chalk.white('Registers:'));
  console.log(
    chalk.white(
      (await formatRegisters(crashLog.registers)).toString({
        cellSeparator: '  ',
        printHeaderSeparator: false,
      }),
    ),
  );

  // backtrace
  if (crashLog.backtrace.length > 0) {
    console.log();
    console.log(chalk.green('🚀'), chalk.white('Backtrace:'));
    console.log(chalk.white((await formatBacktrace(crashLog.backtrace)).toString()));
  }

  // CFSR help text
  if (crashLog.registers.CFSR !== 0) {
    console.log();
    console.log(
      chalk.blue('❓'),
      chalk.white('For more information on how to interpret the CFSR flags, see:'),
      chalk.white('\n -'),
      chalk.blue(chalk.underline('https://interrupt.memfault.com/blog/cortex-m-fault-debug')),
      chalk.white('\n -'),
      chalk.blue(
        chalk.underline(
          'https://developer.arm.com/documentation/dui0552/a/cortex-m3-peripherals/system-control-block/configurable-fault-status-register',
        ),
      ),
      chalk.white('\n -'),
      chalk.blue(
        chalk.underline(
          'https://developer.arm.com/documentation/dui0553/a/the-cortex-m4-processor/exception-model/fault-reporting/cfsr---configurable-fault-status-register',
        ),
      ),
    );
  }
}
main();

// #region enquirer validators

function validatePathExists(path: string): true | string {
  if (fs.existsSync(path)) {
    return true;
  }

  return 'cannot access file';
}

async function validateAddr2Line(path: string): Promise<true | string> {
  try {
    await execAsync(`${path} --version`);
    return true;
  } catch (error) {
    return `cannot execute ${path}: ${error}`;
  }
}

async function validateCrashLog(input: string): Promise<true | string> {
  // must not be empty
  if (input.trim().length <= 0) {
    return 'cannot be empty';
  }

  // check if any parser can handle the input
  for (const p of PARSERS) {
    if (await p.canParse(cleanupAndSplitCrashLog(input))) {
      return true;
    }
  }

  return "couldn't find a parser for the given crash log";
}

// #endregion

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

    const functionPlusOffset = `${item.function?.baseAddress.toHex(4) ?? '??'}+${
      item.function?.instructionOffset ?? '??'
    }`;
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
