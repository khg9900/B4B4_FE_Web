import { api } from '../api/http';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './tokenStore';

export function isTokenExpired(token: string, skewMs = 30_000): boolean {
  try {
    const [, payloadB64] = token.split('.');
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    const expMs = (payload.exp as number) * 1000;
    return Date.now() >= expMs - skewMs;
  } catch {
    return true;
  }
}

let refreshing: Promise<boolean> | null = null;
export async function tryRefresh(): Promise<boolean> {
  if (refreshing) return refreshing;

  const rt = getRefreshToken();
  if (!rt) return false;

  refreshing = (async () => {
    try {
      const res = await api.post('/auth/refresh', { refreshToken: rt });
      const payload = res.data?.payload ?? res.data;
      if (!payload?.accessToken) return false;
      saveTokens(payload.accessToken, payload.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

export async function ensureAuthOnBoot(): Promise<void> {
  const at = getAccessToken();
  if (!at) return;

  if (isTokenExpired(at)) {
    const ok = await tryRefresh();
    if (!ok) clearTokens();
  }
}
