import { getCLIArgs } from './ui/cli';
import { getUserInput } from './ui/tui';
import { processAndPrintCrashLog, processingArgsPopulated } from './processing';

async function main() {
  // get args from CLI
  let opts = await getCLIArgs();

  // populate missing args using TUI
  if (!processingArgsPopulated(opts)) {
    opts = {
      ...opts,
      ...(await getUserInput(opts)),
    };
  }

  // ensure args are populated
  if (!processingArgsPopulated(opts)) {
    console.error('Some required arguments are missing.');
    process.exit(1);
  }

  // process and print the crash log
  await processAndPrintCrashLog(opts);
}
main();
