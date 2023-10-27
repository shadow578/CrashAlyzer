import { getUserInput } from './ui/tui';
import { processAndPrintCrashLog } from './processing';

async function main() {
  const opts = await getUserInput();

  await processAndPrintCrashLog(opts);
}
main();
