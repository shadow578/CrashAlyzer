
export const MEMFAULTSR_MASK = 0xff
export const MMARVALID_MASK = 1 << 7
export const MLSPERR_MASK = 1 << 5
export const MSTKERR_MASK = 1 << 4
export const MUNSTKERR_MASK = 1 << 3
export const DACCVIOL_MASK = 1 << 1
export const IACCVIOL_MASK = 1 << 0


export const BUSFAULTSR_MASK = 0xff << 8
export const BFARVALID_MASK = 1 << 7
export const LSPERR_MASK = 1 << 5
export const STKERR_MASK = 1 << 4
export const UNSTKERR_MASK = 1 << 3
export const IMPRECISERR_MASK = 1 << 2
export const PRECISERR_MASK = 1 << 1
export const IBUSERR_MASK = 1 << 0


export const USAGEFAULTSR_MASK = 0xff << 16
export const DIVBYZERO_MASK = 1 << 9
export const UNALIGNED_MASK = 1 << 8
export const NOCP_MASK = 1 << 3
export const INVPC_MASK = 1 << 2
export const INVSTATE_MASK = 1 << 1
export const UNDEFINSTR_MASK = 1 << 0

