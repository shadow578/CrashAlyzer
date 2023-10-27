/**
 * clean up crash log and split into lines
 *
 * @param crashLog the crash log to cleanup
 * @returns the cleaned up crash log lines
 */
export function cleanupAndSplitCrashLog(crashLog: string): string[] {
  return crashLog
    .split(/\r?\n/) // split into lines
    .map((line) => line.trim()) // trim whitespace
    .map((line) => line.replace(/^recv:/i, '')) // remove 'Recv:' prefix (OctoPrint terminal)
    .map((line) => line.replace(/^send:/i, '')) // remove 'Send:' prefix (OctoPrint terminal)
    .map((line) => line.trim()) // trim whitespace again
    .filter((line) => line.length > 0); // remove empty lines
}
