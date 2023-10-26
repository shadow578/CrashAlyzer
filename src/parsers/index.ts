import { CrashLogParser } from './base';
import { MarlinParser } from './marlin';

const parsers: CrashLogParser[] = [new MarlinParser()];

export default parsers;
export { CrashLogParser };
