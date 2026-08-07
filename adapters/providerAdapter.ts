import { BaseAdapter } from './baseAdapter';

export interface CodeReviewResult {
  passed: boolean;
  issues: Array<{
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    file: string;
    message: string;
  }>;
  suggestions: string[];
}

export abstract class ProviderAdapter extends BaseAdapter {
  public abstract role: 'BUILDER' | 'REVIEWER' | 'EXECUTOR';

  public abstract executeTask(taskDescription: string, context?: any): Promise<{ success: boolean; output: string }>;
  public abstract reviewCode(targetFiles: string[]): Promise<CodeReviewResult>;
}
