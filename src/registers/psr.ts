import { checkFlags } from './common';

/**
 * APSR flag names to bit position in Application Program Status Register
 */
const APSRFlags = {
  N: 31,
  Z: 30,
  C: 29,
  V: 28,
  Q: 27,
};

const APSROffset = 0;

/**
 * IPSR is a 8-bit field in the PSR
 */
const IPSRMask = 0x000000ff;

export type APSRFlag = keyof typeof APSRFlags;

export interface PSR {
  APSR: Set<APSRFlag>;
  IPSR: number;
}

/**
 * parse PSR register value into set of APSR flags and IPSR value
 *
 * @param psr PSR register value
 * @returns parsed PSR register value
 */
export function parse(psr: number): PSR {
  const APSR = new Set<APSRFlag>();
  checkFlags(psr, APSR, APSROffset, APSRFlags);

  const IPSR = psr & IPSRMask;

  return {
    APSR,
    IPSR,
  };
}
