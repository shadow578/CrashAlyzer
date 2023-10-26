import { checkFlags } from './common';

/**
 * HardFault flag names to bit position in Hard Fault Status Register
 */
const HardFaultFlags = {
  DEBUGEVT: 31,
  FORCED: 30,
  VECTBL: 1,
};

export type HFSRFaultFlag = keyof typeof HardFaultFlags;

/**
 * parse HFSR register value into set of fault flags
 *
 * @param hfsr HFSR register value
 * @returns set of HFSR fault flags
 */
export function parse(hfsr: number): Set<HFSRFaultFlag> {
  const flags = new Set<HFSRFaultFlag>();

  checkFlags(hfsr, flags, 0, HardFaultFlags);

  return flags;
}
