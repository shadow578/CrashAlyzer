import { cleanupAndSplitCrashLog } from '../../parsers';

describe('cleanupAndSplitCrashLog', () => {
  test('should split crash log into lines', () => {
    const crashLog = `
        
        *** HARDFAULT ***
        - FSR / FAR:
        SCB->HFSR = 0x40000000
        SCB->CFSR = 0x02000000
        SCB->DFSR = 0x00000000
        SCB->AFSR = 0x00000000
        - Usage fault:
         * DIVBYZERO
        - Stack frame:
        R0 = 0x00000002
        R1 = 0x1fff8c0c
        R2 = 0x00000000
        R3 = 0x000001c4
        R12 = 0x7fffffff
        LR = 0x1fff848c
        PC = 0x0001af4a
        PSR = 0x61000000
        - Misc:
        LR = 0xfffffff9
        ***
        `;
    const lines = cleanupAndSplitCrashLog(crashLog);

    expect(lines).toHaveLength(20);
    expect(lines).toEqual([
      '*** HARDFAULT ***',
      '- FSR / FAR:',
      'SCB->HFSR = 0x40000000',
      'SCB->CFSR = 0x02000000',
      'SCB->DFSR = 0x00000000',
      'SCB->AFSR = 0x00000000',
      '- Usage fault:',
      '* DIVBYZERO',
      '- Stack frame:',
      'R0 = 0x00000002',
      'R1 = 0x1fff8c0c',
      'R2 = 0x00000000',
      'R3 = 0x000001c4',
      'R12 = 0x7fffffff',
      'LR = 0x1fff848c',
      'PC = 0x0001af4a',
      'PSR = 0x61000000',
      '- Misc:',
      'LR = 0xfffffff9',
      '***',
    ]);
  });

  test('should remove empty lines', () => {
    const crashLog = `
        
        *** HARDFAULT ***
        - FSR / FAR:
        SCB->HFSR = 0x40000000
        SCB->CFSR = 0x02000000
        SCB->DFSR = 0x00000000


        SCB->AFSR = 0x00000000
        - Usage fault:
         * DIVBYZERO
        - Stack frame:
        R0 = 0x00000002

        R1 = 0x1fff8c0c
        R2 = 0x00000000

        R3 = 0x000001c4
        R12 = 0x7fffffff
        LR = 0x1fff848c


        PC = 0x0001af4a
        PSR = 0x61000000
        - Misc:

        LR = 0xfffffff9
        ***
        `;
    const lines = cleanupAndSplitCrashLog(crashLog);

    expect(lines).toHaveLength(20);
    expect(lines).toEqual([
      '*** HARDFAULT ***',
      '- FSR / FAR:',
      'SCB->HFSR = 0x40000000',
      'SCB->CFSR = 0x02000000',
      'SCB->DFSR = 0x00000000',
      'SCB->AFSR = 0x00000000',
      '- Usage fault:',
      '* DIVBYZERO',
      '- Stack frame:',
      'R0 = 0x00000002',
      'R1 = 0x1fff8c0c',
      'R2 = 0x00000000',
      'R3 = 0x000001c4',
      'R12 = 0x7fffffff',
      'LR = 0x1fff848c',
      'PC = 0x0001af4a',
      'PSR = 0x61000000',
      '- Misc:',
      'LR = 0xfffffff9',
      '***',
    ]);
  });

  test('should handle OctoPrint terminal prefix "Recv:"', () => {
    const crashLog = `
        Recv:
        Recv: *** HARDFAULT ***
        Recv: - FSR / FAR:
        Recv: SCB->HFSR = 0x40000000
        Recv: SCB->CFSR = 0x02000000
        Recv: SCB->DFSR = 0x00000000
        Recv: SCB->AFSR = 0x00000000
        Recv: - Usage fault:
        Recv:  * DIVBYZERO
        recv: - Stack frame:
        recv: R0 = 0x00000002
        recv: R1 = 0x1fff8c0c
        recv: R2 = 0x00000000
        recv: R3 = 0x000001c4
        recv: R12 = 0x7fffffff
        recv: LR = 0x1fff848c
        recv: PC = 0x0001af4a
        recv: PSR = 0x61000000
        recv: - Misc:
        recv: LR = 0xfffffff9
        recv: ***
        `;
    const lines = cleanupAndSplitCrashLog(crashLog);

    expect(lines).toHaveLength(20);
    expect(lines).toEqual([
      '*** HARDFAULT ***',
      '- FSR / FAR:',
      'SCB->HFSR = 0x40000000',
      'SCB->CFSR = 0x02000000',
      'SCB->DFSR = 0x00000000',
      'SCB->AFSR = 0x00000000',
      '- Usage fault:',
      '* DIVBYZERO',
      '- Stack frame:',
      'R0 = 0x00000002',
      'R1 = 0x1fff8c0c',
      'R2 = 0x00000000',
      'R3 = 0x000001c4',
      'R12 = 0x7fffffff',
      'LR = 0x1fff848c',
      'PC = 0x0001af4a',
      'PSR = 0x61000000',
      '- Misc:',
      'LR = 0xfffffff9',
      '***',
    ]);
  });

  test('should handle OctoPrint terminal prefix "Send:"', () => {
    const crashLog = `
        send: M300 S440 P2000
        Send: D451 T2
        Recv: Disabling heaters
        Recv: 
        Recv:
        Recv: *** HARDFAULT ***
        `;
    const lines = cleanupAndSplitCrashLog(crashLog);

    expect(lines).toHaveLength(4);
    expect(lines).toEqual([
      'M300 S440 P2000', //
      'D451 T2',
      'Disabling heaters',
      '*** HARDFAULT ***',
    ]);
  });
});
