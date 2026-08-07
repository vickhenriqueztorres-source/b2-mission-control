export class Logger {
  public static info(context: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] [${context}] ${message}`, data ? JSON.stringify(data) : '');
  }

  public static warn(context: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] [${context}] ${message}`, data ? JSON.stringify(data) : '');
  }

  public static error(context: string, message: string, error?: any) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] [${context}] ${message}`, error || '');
  }
}
