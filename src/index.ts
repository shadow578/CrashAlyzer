// Usage: node postmortem_analyzer.js [<addr2line_path>] [<firmware.elf>] <backtrace.txt>
// or: node postmortem_analyzer.js [<addr2line_path>] [<firmware.elf>] (will prompt for backtrace input)
//
// - <addr2line_path> - path to the addr2line executable. defaults to 'arm-none-eabi-addr2line'
// - <firmware.elf> - path to the firmware elf file. defaults to './firmware.elf'
// - <backtrace.txt> - path to the backtrace file to analyze. if not provided, will prompt for input
//
// ALL PARAMETERS ARE POSITIONAL

import * as fs from 'fs/promises';
import * as fssync from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as readline from 'readline';

const execAsync = promisify(exec);

let addr2linePath: string;
let elfPath: string;

interface Addr2LineResult {
  filePath: string;
  fileName: string;
  line: number;
  function: string;
}

interface BacktraceInfo {
  position: number;
  name: string;
  fnAddress: number;
  fnOffset: number;
  pc: number;
}

async function addr2Line(address: number): Promise<Addr2LineResult> {
  // addr2line -e <elf> -f -C <address>
  // -e <elf> - the elf file to use
  // -f - show function name
  // -C - demangle function name
  // <address> - the address to lookup
  const cmd = `${addr2linePath} -e ${elfPath} -f -C ${address.toString(16)}`;
  const output = await execAsync(cmd);

  // parse output
  //> GcodeSuite::process_parsed_command(bool)
  //> E:\Source\marlin\Marlin-H32/Marlin\src\gcode/gcode.cpp:339
  const lines = output.stdout.split(/\r?\n/);
  const fn = lines[0];
  const fileLine = lines[1];

  const pattern = /(.+):(\d+)/;
  const match = pattern.exec(fileLine);
  if (!match) {
    throw new Error(`Failed to parse addr2line output: ${output.stdout}`);
  }
  const filePath = match[1];
  const line = match[2];

  const fileName = path.basename(filePath);

  return {
    filePath,
    fileName: fileName || filePath,
    line: parseInt(line, 10),
    function: fn,
  };
}

async function parseBacktraceLine(line: string): Promise<(Addr2LineResult & BacktraceInfo) | undefined> {
  // check if the line contains a backtrace entry
  // #1<position> : <name>@<address>+<offset> PC:<address>
  // #1 : unknown@0x0001C38C+182 PC:0x0001C442
  const pattern = /#(\d+) : ([^@]+)@0x([0-9A-Fa-f]+)\+(\d+) PC:0x([0-9A-Fa-f]+)/;
  const match = pattern.exec(line);
  if (!match) {
    return;
  }

  //const matchStr = match[0];
  const position = parseInt(match[1], 10); // DEC
  const name = match[2];
  const fnAddress = parseInt(match[3], 16); // HEX
  const fnOffset = parseInt(match[4], 10); // DEC
  const pc = parseInt(match[5], 16); // HEX

  // lookup pc address in elf file
  return {
    ...(await addr2Line(pc)),
    position,
    name,
    fnAddress,
    fnOffset,
    pc,
  };
}

function numToHex(num: number): string {
  return '0x' + num.toString(16).padStart(8, '0');
}

function readMultilineInput(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const inputLines: string[] = [];

  return new Promise<string>((resolve) => {
    const readLine = () => {
      rl.question('', (line) => {
        if (line === '') {
          rl.close();
          resolve(inputLines.join('\n'));
        } else {
          inputLines.push(line);
          readLine();
        }
      });
    };

    readLine();
  });
}

async function main() {
  // read args
  const args = process.argv.slice(2);
  addr2linePath = args[0] || 'arm-none-eabi-addr2line';
  elfPath = args[1] || './firmware.elf';
  const backtracePath = args[2];

  // check elf file exists
  if (!fssync.existsSync(elfPath)) {
    throw new Error(`Elf file not found: ${elfPath}`);
  }

  // read backtrace from user input or file
  let backtrace_text: string;
  if (backtracePath && fssync.existsSync(backtracePath)) {
    // read backtrace from file
    backtrace_text = await fs.readFile(backtracePath, 'utf-8');
  } else {
    // get backtrace from user input
    console.log('Enter backtrace:');
    backtrace_text = await readMultilineInput();
  }

  // split file into lines
  const lines = backtrace_text.split('\n');

  // parse lines of the backtrace
  console.log('Backtrace:');
  const btLines: string[][] = [['#', 'Function', 'Address', 'PC', 'File:Line']];
  for (const line of lines) {
    const bt = await parseBacktraceLine(line);
    if (bt) {
      btLines.push([
        `#${bt.position}`,
        `${bt.function}${bt.name == 'unknown' ? '' : ` (${bt.name})`}`,
        `@ ${numToHex(bt.fnAddress)} + ${bt.fnOffset}`,
        `PC:${numToHex(bt.pc)}`,
        `${bt.fileName}:${bt.line}`,
      ]);
    }
  }

  // output btLines as table, column width is determined by the longest entry in each column
  const columnWidths: number[] = [];
  for (const line of btLines) {
    for (let i = 0; i < line.length; i++) {
      const len = line[i].length;
      if (columnWidths[i] == undefined || len > columnWidths[i]) {
        columnWidths[i] = len;
      }
    }
  }

  // format and output lines
  for (const line of btLines) {
    let str = '';
    for (let i = 0; i < line.length; i++) {
      const len = columnWidths[i];
      const entry = line[i];
      str += entry.padEnd(len + 2, ' ');
    }
    console.log(str);
  }
}

main()
  .then(() => {
    console.log('done');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
