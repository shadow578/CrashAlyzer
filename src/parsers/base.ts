/**
 * register values dumped during crash, auto-stacked by the CPU
 */
export interface CrashLogRegisters {
  R0?: number;
  R1?: number;
  R2?: number;
  R3?: number;
  R12?: number;
  LR?: number;
  PC?: number;
  PSR?: number;
  CFSR?: number;
  HFSR?: number;
  DFSR?: number;
  AFSR?: number;
  MMAR?: number;
  BFAR?: number;
  ExcLR?: number;
  ExcSP?: number;
}

/**
 * a single item in the backtrace
 */
export interface BacktraceItem {
  /**
   * function of the trace item
   */
  function?: {
    /**
     * name of the function, if known
     */
    name?: string;

    /**
     * address of the function
     */
    baseAddress: number;

    /**
     * offset of the instruction within the function
     */
    instructionOffset: number;
  };

  /**
   * program counter value of the trace item
   */
  PC: number;
}

/**
 * backtrace of the crash
 */
export type BackTrace = BacktraceItem[];

/**
 * parsed crash log
 */
export interface CrashLog {
  /**
   * registers dumped during crash
   */
  registers: CrashLogRegisters;

  /**
   * backtrace of the crash
   */
  backtrace: BackTrace;
}

/**
 * base class for crash log parsers
 */
export abstract class CrashLogParser {
  /**
   * name of the crash log parser, e.g. 'marlin'
   */
  public abstract get name(): string;

  /**
   * does this parser support backtrace parsing?
   */
  public abstract get backtraceSupported(): boolean;

  /**
   * check if this parser can parse the given crash log
   *
   * @param crashLogLines lines of the crash log, empty lines are already removed
   * @returns true if this parser can parse the given crash log
   */
  public abstract canParse(crashLogLines: string[]): Promise<boolean>;

  /**
   * parse the given crash log into a CrashLog object
   *
   * @param crashLogLines lines of the crash log, empty lines are already removed
   * @returns parsed crash log
   */
  public abstract parse(crashLogLines: string[]): Promise<CrashLog>;
}
