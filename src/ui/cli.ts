import { ProcessingArgs } from '../processing';
import * as yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { addr2lineAvailable } from '../addr2line';
import { DEFAULT_ELF_PATH, DEFAULT_ADDR2LINE_PATH } from './defaults';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as chalk from 'chalk';

/**
 * gathers processing args from the command line interface
 *
 * @returns processing args gathered from the CLI
 */
export async function getCLIArgs(): Promise<Partial<ProcessingArgs>> {
  // parse command line arguments
  const {
    log: logPath,
    input: elfPath,
    addr2line: addr2linePath,
  } = await yargs(hideBin(process.argv))
    .option('log', {
      alias: 'l',
      type: 'string',
      description: 'Path to Crash Log File',
      requiresArg: false,
    })
    .option('input', {
      alias: 'i',
      type: 'string',
      description: 'Path to Firmware ELF File',
      default: DEFAULT_ELF_PATH,
      defaultDescription: `${DEFAULT_ELF_PATH} from the current working directory`,
      requiresArg: false,
    })
    .option('addr2line', {
      alias: 'a',
      type: 'string',
      description: 'Path to Addr2line',
      default: DEFAULT_ADDR2LINE_PATH,
      defaultDescription: `${DEFAULT_ADDR2LINE_PATH} from the current working directory or PATH`,
      requiresArg: true,
    }).argv;

  let crashLog: string | undefined = undefined;
  if (logPath) {
    // if --log is provided, read the file
    try {
      crashLog = await fs.readFile(logPath, 'utf8');
    } catch (error) {
      console.error(chalk.red('🙅‍♂️ Oops! It seems we cannot access the log file you provided.'));
      process.exit(1);
    }
  } else {
    // otherwise, read data piped into stdin
    crashLog = await readStdin();
  }

  // if the crash log is empty, set it to undefined to allow the user to enter it later
  if (crashLog.trim().length <= 0) {
    crashLog = undefined;
  }

  // validate elf input exists
  if (!fsSync.existsSync(elfPath)) {
    console.error(chalk.red('🙅‍ Oops! It seems we cannot access the firmware ELF file you provided.'));
    process.exit(1);
  }

  // validate addr2line is accessible
  if (!(await addr2lineAvailable(addr2linePath))) {
    console.error(chalk.red('🙅‍ Oops! It seems we cannot access the addr2line binary you provided.'));
    process.exit(1);
  }

  return {
    crashLog,
    elfPath,
    addr2linePath,
  };
}

/**
 * read data piped into stdin
 *
 * @returns the string piped into stdin
 */
async function readStdin(): Promise<string> {
  process.stdin.setEncoding('utf8');

  if (!process.stdin.isTTY) {
    let data = '';
    for await (const chunk of process.stdin) {
      data += chunk;
    }
    return data;
  } else {
    // no data piped
    return Promise.resolve('');
  }
}
