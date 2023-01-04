export interface TaskContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trace(error: Error, ...params: any[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  trace(obj: Object, ...params: any[]): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(error: Error, ...params: any[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  warn(obj: Object, ...params: any[]): void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(error: Error, ...params: any[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  error(obj: Object, ...params: any[]): void;
}
