import PARSERS, { cleanupAndSplitCrashLog } from '../parsers';
import { ProcessingArgs } from '../processing';
import { prompt } from 'enquirer';
import * as fs from 'fs';
import { DEFAULT_ELF_PATH } from './defaults';

type RemoveArray<T> = T extends (infer U)[] ? U : T;
type PromptOptions = RemoveArray<Parameters<typeof prompt>[0]>;

/**
 * gathers processing args from the user using a terminal UI
 *
 * @param existingArgs existing processing args previously gathered from the CLI
 * @returns processing args gathered from the user
 */
export async function getUserInput(existingArgs: Partial<ProcessingArgs>): Promise<Partial<ProcessingArgs>> {
  const maybePrompt = (arg: keyof ProcessingArgs, prompt: PromptOptions): PromptOptions[] => {
    if (existingArgs[arg] !== undefined) {
      return [];
    }

    return [prompt];
  };

  const userInput = (await prompt([
    ...maybePrompt('crashLog', {
      type: 'input',
      name: 'crashLog',
      multiline: true,
      message: 'Crash Log',
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

        return 'no parser found for the provided crash log! is it supported?';
      },
    }),
    ...maybePrompt('elfPath', {
      type: 'input',
      name: 'elfPath',
      initial: DEFAULT_ELF_PATH,
      message: 'Path to ELF File',
      validate: (path) => {
        if (fs.existsSync(path)) {
          return true;
        }

        return 'the firmware.ELF was not found at the specified path! please check your input.';
      },
    }),
  ])) as {
    crashLog?: string;
    elfPath?: string;
  };

  return userInput;
}
