/**
 * check if flag is set in register
 *
 * @param reg register value
 * @param offset offset of flag in register
 * @param bit flag bit position in register
 * @returns is flag set
 */
export function checkFlag(reg: number, offset: number, bit: number): boolean {
  return (reg & (1 << (offset + bit))) !== 0;
}

/**
 * check if flags are set in register
 *
 * @param reg register value
 * @param flags flags set to add to
 * @param offset offset of flags in register
 * @param flagDef flag definitions Record<flag name, bit position>
 */
export function checkFlags<T>(reg: number, flags: Set<T>, offset: number, flagDef: Record<string, number>): void {
  for (const flag of Object.keys(flagDef)) {
    if (checkFlag(reg, offset, flagDef[flag])) {
      flags.add(flag as T);
    }
  }
}
