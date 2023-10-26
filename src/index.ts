import PARSERS, { CrashLogParser } from './parsers/index';

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

async function main() {
  //TODO read args / user input
  const addr2LinePath = 'arm-none-eabi-addr2line';
  const elfPath = './firmware.elf';
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

  console.log('e');
}
main();
