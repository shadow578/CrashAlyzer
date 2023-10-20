/**
 * CFSR MemFault flag names to bit position in MemManage Fault Status Register
 */
const MemFaultFlags = {
  MMARVALID: 7,
  MLSPERR: 5,
  MSTKERR: 4,
  MUNSTKERR: 3,
  DACCVIOL: 1,
  IACCVIOL: 0,
};

/**
 * CFSR BusFault flag names to bit position in Bus Fault Status Register
 */
const BusFaultFlags = {
  BFARVALID: 7,
  LSPERR: 5,
  STKERR: 4,
  UNSTKERR: 3,
  IMPRECISERR: 2,
  PRECISERR: 1,
  IBUSERR: 0,
};

/**
 * CFSR UsageFault flag names to bit position in Usage Fault Status Register
 */
const UsageFaultFlags = {
  DIVBYZERO: 9,
  UNALIGNED: 8,
  NOCP: 3,
  INVPC: 2,
  INVSTATE: 1,
  UNDEFINSTR: 0,
};

/**
 * offset of MemManage Fault Status Register in CFSR
 */
const MMFSR_OFFSET = 0;

/**
 * offset of Bus Fault Status Register in CFSR
 */
const BFSR_OFFSET = 8;

/**
 * offset of Usage Fault Status Register in CFSR
 */
const UFSR_OFFSET = 16;

export type MemFaultFlag = keyof typeof MemFaultFlags;
export type BusFaultFlag = keyof typeof BusFaultFlags;
export type UsageFaultFlag = keyof typeof UsageFaultFlags;
export type CFSRFaultFlag = MemFaultFlag | BusFaultFlag | UsageFaultFlag;

/**
 * parse CFSR register value into set of CFSR fault flags
 *
 * @param cfsr CFSR register value
 * @returns set of CFSR fault flags
 */
export function parseCFSR(cfsr: number): Set<CFSRFaultFlag> {
  const flags = new Set<CFSRFaultFlag>();

  const checkFlag = (offset: number, bit: number): boolean => {
    return (cfsr & (1 << (offset + bit))) !== 0;
  };

  const checkFlags = (offset: number, flagDef: Record<string, number>): void => {
    for (const flag of Object.keys(flagDef)) {
      if (checkFlag(offset, flagDef[flag])) {
        flags.add(flag as CFSRFaultFlag);
      }
    }
  };

  checkFlags(MMFSR_OFFSET, MemFaultFlags);
  checkFlags(BFSR_OFFSET, BusFaultFlags);
  checkFlags(UFSR_OFFSET, UsageFaultFlags);

  return flags;
}
