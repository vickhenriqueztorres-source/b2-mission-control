export abstract class BaseAdapter {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }

  public abstract initialize(): Promise<void>;
  public abstract checkHealth(): Promise<boolean>;
}
