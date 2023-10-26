import { CrashLogParser, CrashLog, BacktraceItem, BackTrace, CrashLogRegisters } from './base';
import { MarlinParser } from './marlin';

const parsers: CrashLogParser[] = [new MarlinParser()];

export default parsers;
export { CrashLogParser, CrashLog, BacktraceItem, BackTrace, CrashLogRegisters };
