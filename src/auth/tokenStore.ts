// src/auth/tokenStore.ts
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
