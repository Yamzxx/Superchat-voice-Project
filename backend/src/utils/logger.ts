const colors = {
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  reset: '\x1b[0m',
};

function timestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

export const logger = {
  info: (msg: string, ...args: any[]) =>
    console.log(`${colors.info}[INFO]${colors.reset} ${timestamp()} ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) =>
    console.warn(`${colors.warn}[WARN]${colors.reset} ${timestamp()} ${msg}`, ...args),
  error: (msg: string, ...args: any[]) =>
    console.error(`${colors.error}[ERROR]${colors.reset} ${timestamp()} ${msg}`, ...args),
};
