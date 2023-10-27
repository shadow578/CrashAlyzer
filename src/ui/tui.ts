import PARSERS, { cleanupAndSplitCrashLog } from '../parsers';
import { addr2lineAvailable } from '../addr2line';
import { ProcessingArgs } from '../processing';
import { prompt } from 'enquirer';
import * as fs from 'fs';

/**
 * gathers processing args from the user using a terminal UI
 *
 * @returns processing args gathered from the user
 */
export async function getUserInput(): Promise<ProcessingArgs> {
  const userInput = (await prompt([
    {
      type: 'input',
      name: 'crashLog',
      multiline: true,
      message: 'Crash Log 📃',
      validate: async (input) => {
        // must not be empty
        if (input.trim().length <= 0) {
          return '🙅‍♂️ Crash log cannot be empty. Please re-enter the crash log.';
        }

        // check if any parser can handle the input
        for (const p of PARSERS) {
          if ((await p.findStartIndex(cleanupAndSplitCrashLog(input))).canParse) {
            return true;
          }
        }

        return "Oops! It seems we couldn't find a parser for the given crash log. Please re-enter the crash log. 🤔";
      },
    },
    {
      type: 'input',
      name: 'elfPath',
      initial: './firmware.elf',
      message: 'Path to ELF File 📂',
      validate: (path) => {
        if (fs.existsSync(path)) {
          return true;
        }

        return 'Uh-oh! It seems we cannot access the firmware file you provided. Please re-enter the path to firmware.elf. 🤖';
      },
    },
    {
      type: 'input',
      name: 'addr2linePath',
      initial: 'arm-none-eabi-addr2line',
      message: 'Path to Addr2line 📂',
      validate: async (path) => {
        if (await addr2lineAvailable(path)) {
          return true;
        }

        return `Oops! It appears we cannot execute addr2line @ ${path}. Please re-enter the path to addr2line. 🤷‍♂️`;
      },
    },
  ])) as {
    crashLog: string;
    elfPath: string;
    addr2linePath: string;
  };

  return userInput;
}
