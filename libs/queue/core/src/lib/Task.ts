export abstract class Task<
  Instance extends Task<Instance>,
> {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public abstract execute(...input: any[]): Promise<any>;

}
