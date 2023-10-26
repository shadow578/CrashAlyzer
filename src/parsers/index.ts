import { CrashLogParser, CrashLog, BacktraceItem, BackTrace, CrashLogRegisters } from './base';
import { HC32Parser } from './hc32';
import { MarlinParser } from './marlin';

const parsers: CrashLogParser[] = [
    new MarlinParser(),
    new HC32Parser()
];

export default parsers;
export { CrashLogParser, CrashLog, BacktraceItem, BackTrace, CrashLogRegisters };
