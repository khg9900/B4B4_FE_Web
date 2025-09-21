// src/utils/logger.ts
type Level = 'debug' | 'info' | 'warn' | 'error' | 'none';

function safeEnv(): Partial<Record<string,string>> {
  try {
    // Vite
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vite = (typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined) || {};
    // CRA/Webpack
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cra  = (typeof process !== 'undefined' && (process as any).env) || {};
    return { ...vite, ...cra };
  } catch { return {}; }
}

function getLogLevel(): Level {
  const env = safeEnv();
  const v =
    (env.VITE_LOG_LEVEL as Level | undefined) ||
    (env.REACT_APP_LOG_LEVEL as Level | undefined) ||
    'error';
  return (['debug','info','warn','error','none'].includes(v) ? v : 'error') as Level;
}

const level = getLogLevel();

const enabled = {
  debug: level === 'debug',
  info:  level === 'debug' || level === 'info',
  warn:  level === 'debug' || level === 'info' || level === 'warn',
  error: level !== 'none',
};

export const logger = {
  debug: (...a: unknown[]) => enabled.debug && console.debug(...a),
  info:  (...a: unknown[]) => enabled.info  && console.info(...a),
  warn:  (...a: unknown[]) => enabled.warn  && console.warn(...a),
  error: (...a: unknown[]) => enabled.error && console.error(...a),
  capture: (label: string, err: unknown, extra?: unknown) => {
    try {
      const e = err instanceof Error ? err : new Error(String(err));
      logger.error(`[${label}] ${e.message}`, { stack: e.stack, extra });
    } catch {
      // 마지막 안전장치
      // eslint-disable-next-line no-console
      console.error(`[${label}]`, err);
    }
  },
} as const;
