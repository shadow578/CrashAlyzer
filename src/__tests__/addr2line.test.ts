import * as path from 'path';
import { addr2lineAvailable, addr2line, setAddr2LinePath } from '../addr2line';
import * as fsSync from 'fs';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';

const firmwarePath = path.join(__dirname, 'assets', 'firmware.elf');
const firmwareSHA256 = '4887544DAC870B1482CE6BC3F5F5C7F444AB12CB317C04413603C6D2B8B59176';

setAddr2LinePath('arm-none-eabi-addr2line');

describe('validate test assets', () => {
  test('firmware.elf exists', () => {
    expect(fsSync.existsSync(firmwarePath)).toBeTruthy();
  });

  test('firmware.elf SHA256 matches known value', async () => {
    const sha256 = await (async () => {
      const hash = crypto.createHash('sha256');
      hash.update(await fs.readFile(firmwarePath));
      return hash.digest('hex');
    })();

    expect(sha256.toUpperCase()).toBe(firmwareSHA256);
  });
});

describe('addr2lineAvailable', () => {
  test('check if addr2line is available', async () => {
    expect(await addr2lineAvailable()).toBeTruthy();
  });

  test('fails for non-existing executable', async () => {
    // if you happen to have an executable named 'non-existing-executable-that-does-not-exist' in your PATH, this test will fail
    // but tbh, if you have that, you kinda deserve it
    expect(await addr2lineAvailable('non-existing-executable-that-does-not-exist')).toBeFalsy();
  });

  test('fails for executable other than addr2line file', async () => {
    expect(await addr2lineAvailable('arm-none-eabi-gcc')).toBeFalsy();
  });
});

describe('addr2line', () => {
  test('addr2line should return the correct file and line number (#1)', async () => {
    const a2l = await addr2line(firmwarePath, 0x00013e82);

    expect(a2l).toEqual({
      file: {
        name: 'main.cpp',
        path: expect.stringMatching(
          // on Windows (platformio addr2line): C:\Users\Username\.platformio\packages\framework-arduino-hc32f46x\cores\arduino\main/main.cpp
          // on Linux /CI (apt default addr2line): E:\Source\marlin\Marlin-H32/C:\Users\Username\.platformio\packages\framework-arduino-hc32f46x\cores\arduino\main/main.cpp
          /(?:C:\\Users\\Username\\\.platformio\\packages\\framework-arduino-hc32f46x\\cores\\arduino\\main\/main\.cpp)|(?:E:\\Source\\marlin\\Marlin-H32\/C:\\Users\\Username\\.platformio\\packages\\framework-arduino-hc32f46x\\cores\\arduino\\main\/main\.cpp)/,
        ),
      },
      line: 20,
      functionName: 'main',
    });
  });

  test('addr2line should return the correct file and line number (#2)', async () => {
    const a2l = await addr2line(firmwarePath, 0x0001c7b2);

    expect(a2l).toEqual({
      file: {
        name: 'gcode_d.cpp',
        path: 'E:\\Source\\marlin\\Marlin-H32/Marlin\\src\\gcode/gcode_d.cpp',
      },
      line: 268,
      functionName: 'GcodeSuite::D(short)',
    });
  });

  test('addr2line should return the correct file and line number (#3)', async () => {
    const a2l = await addr2line(firmwarePath, 0x0001e51a);

    expect(a2l).toEqual({
      file: {
        name: 'queue.cpp',
        path: 'E:\\Source\\marlin\\Marlin-H32/Marlin\\src\\gcode/queue.cpp',
      },
      line: 267,
      functionName: 'GCodeQueue::RingBuffer::ok_to_send()',
    });
  });

  test('addr2line should return the correct file and line number (#4)', async () => {
    const a2l = await addr2line(firmwarePath, 0x000172fc);

    expect(a2l).toEqual({
      file: {
        name: 'MarlinCore.cpp',
        path: 'E:\\Source\\marlin\\Marlin-H32/Marlin\\src/MarlinCore.cpp',
      },
      line: 1679,
      functionName: 'loop',
    });
  });

  test('addr2line should return undefined for invalid address', async () => {
    const a2l = await addr2line(firmwarePath, 0xffffffff);
    expect(a2l).toBeUndefined();
  });
});
