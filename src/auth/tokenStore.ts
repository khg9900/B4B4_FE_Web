// src/auth/tokenStore.ts
export type UserRole = 'GOV' | 'NGO' | 'USER' | 'ADMIN';

const ACCESS_KEY = 'AT';
const REFRESH_KEY = 'RT';

let memoryAT: string | null = null;

export function loadTokensFromStorage() {
  const at = localStorage.getItem(ACCESS_KEY);
  const rt = localStorage.getItem(REFRESH_KEY);
  memoryAT = at;
  return { at, rt };
}

export function getAccessToken(): string | null {
  return memoryAT ?? localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function saveTokens(at: string, rt?: string) {
  memoryAT = at;
  localStorage.setItem(ACCESS_KEY, at);
  if (rt) localStorage.setItem(REFRESH_KEY, rt);
}

export function clearTokens() {
  memoryAT = null;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/* ── JWT payload decode ── */
function decodeJwtPayload(at: string): any | null {
  try {
    const part = at.split('.')[1];
    if (!part) return null;
    const norm = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(norm)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getClaims(): any | null {
  const at = getAccessToken();
  return at ? decodeJwtPayload(at) : null;
}

/* ── 만료 관련 ── */
export function getAccessTokenExp(): number | null {
  const exp = getClaims()?.exp;
  return typeof exp === 'number' ? exp : null; // seconds (Unix)
}

export function isAccessTokenExpired(skewSec = 10): boolean {
  const exp = getAccessTokenExp();
  if (!exp) return !getAccessToken();
  const now = Math.floor(Date.now() / 1000);
  return now >= exp - skewSec;
}

/* ── 현재 역할 ── */
export function getCurrentRole(): UserRole | null {
  const c = getClaims();
  const raw =
    c?.role ??
    c?.auth ??
    (Array.isArray(c?.roles) ? c.roles[0] : undefined) ??
    (Array.isArray(c?.authorities)
      ? (typeof c.authorities[0] === 'string'
          ? c.authorities[0]
          : c.authorities[0]?.authority)
      : undefined);

  if (!raw || typeof raw !== 'string') return null;
  const s = raw.toUpperCase().replace(/^ROLE_/, '');
  if (s.includes('GOV')) return 'GOV';
  if (s.includes('NGO')) return 'NGO';
  if (s.includes('ADMIN')) return 'ADMIN';
  if (s.includes('USER')) return 'USER';
  return null;
}
