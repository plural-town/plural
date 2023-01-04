import { TaskContext } from "./TaskContext";

export abstract class Task<Instance extends Task<Instance>> {
  public constructor(private readonly ctx: TaskContext) {}

  /**
   * Special case to log an `Error` instance to the record.
   * This adds an `err` field with exception details
   * (including the stack) and sets `msg` to the exception
   * message or you can specify the `msg`.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected trace(error: Error, ...params: any[]): void;
  /**
   * The first field can optionally be a "fields" object, which
   * is merged into the log record.
   *
   * To pass in an Error *and* other fields, use the `err`
   * field name for the Error instance.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  protected trace(obj: Object, ...params: any[]): void;
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  protected trace(obj: Error | Object, ...params: any[]): void {
    this.ctx.trace(obj, ...params);
  }

  /**
   * Special case to log an `Error` instance to the record.
   * This adds an `err` field with exception details
   * (including the stack) and sets `msg` to the exception
   * message or you can specify the `msg`.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected warn(error: Error, ...params: any[]): void;
  /**
   * The first field can optionally be a "fields" object, which
   * is merged into the log record.
   *
   * To pass in an Error *and* other fields, use the `err`
   * field name for the Error instance.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  protected warn(obj: Object, ...params: any[]): void;
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  protected warn(obj: Error | Object, ...params: any[]): void {
    return this.ctx.warn(obj, ...params);
  }

  /**
   * Special case to log an `Error` instance to the record.
   * This adds an `err` field with exception details
   * (including the stack) and sets `msg` to the exception
   * message or you can specify the `msg`.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected error(error: Error, ...params: any[]): void;
  /**
   * The first field can optionally be a "fields" object, which
   * is merged into the log record.
   *
   * To pass in an Error *and* other fields, use the `err`
   * field name for the Error instance.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  protected error(obj: Object, ...params: any[]): void;
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  protected error(obj: Error | Object, ...params: any[]): void {
    return this.ctx.error(obj, ...params);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public abstract execute(...input: any[]): Promise<any>;
}
