import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

/**
 * path to addr2line executable, used by addr2line()
 */
// eslint-disable-next-line prefer-const
let addr2linePath = 'arm-none-eabi-addr2line';
export function setAddr2LinePath(path: string) {
  addr2linePath = path;
}

/**
 * result of addr2line invocation
 */
export interface Addr2LineResult {
  /**
   * source file information
   */
  file: {
    /**
     * file name
     */
    name: string;
    /**
     * full file path
     */
    path: string;
  };

  /**
   * line number in the source file
   */
  line: number;

  /**
   * function name the line belongs to
   */
  functionName: string;
}

/**
 * invoke addr2line to lookup the given address
 *
 * @param elfPath the path to the elf file to lookup in
 * @param address the address to lookup
 * @returns the result of the addr2line invocation
 */
export async function addr2line(elfPath: string, address: number): Promise<Addr2LineResult> {
  // addr2line -e <elf> -f -C <address>
  // -e <elf> - the elf file to use
  // -f - show function name
  // -C - demangle function name
  // <address> - the address to lookup
  const output = await execAsync(`${addr2linePath} -e ${elfPath} -f -C ${address.toString(16)}`);

  // parse output
  //> GcodeSuite::process_parsed_command(bool)
  //> C:\path\to\marlin/Marlin\src\gcode/gcode.cpp:339
  const stdout = output.stdout.split(/\r?\n/);
  const functionName = stdout[0];
  const filePathAndLine = stdout[1];

  // split file path and line number
  const pathAndLineMatch = filePathAndLine.match(/(.+):(\d+)/);
  if (!pathAndLineMatch) {
    throw new Error(`failed to parse addr2line output: ${output.stdout}`);
  }

  const filePath = pathAndLineMatch[1];
  const fileName = path.basename(filePath);
  const line = pathAndLineMatch[2];

  return {
    file: {
      name: fileName,
      path: filePath,
    },
    line: parseInt(line, 10),
    functionName,
  };
}
