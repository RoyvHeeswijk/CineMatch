export interface Logger {
    log: (message: string, data?: any) => void;
    error: (message: string, error: any) => void;
    success: (message: string) => void;
    warn: (message: string) => void;
} 