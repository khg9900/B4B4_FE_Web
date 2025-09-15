import { api } from '../api/http';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './tokenStore';

/** exp를 이용해 만료 여부 판단 (기본 30초 스큐) */
export function isTokenExpired(token: string, skewMs = 30_000): boolean {
  try {
    const [, payloadB64] = token.split('.');
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    const expMs = (payload.exp as number) * 1000;
    return Date.now() >= expMs - skewMs;
  } catch {
    // 형식이 이상하면 못 쓰는 토큰으로 간주
    return true;
  }
}

/** 401/만료시에 1회만 갱신 시도 */
let refreshing: Promise<boolean> | null = null;
export async function tryRefresh(): Promise<boolean> {
  if (refreshing) return refreshing;

  const rt = getRefreshToken();
  if (!rt) return false;

  refreshing = (async () => {
    try {
      // 서버 구현에 따라 바디/쿠키 중 택1
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

/** 앱 부팅 시 한번: 만료면 갱신 시도, 실패하면 로그아웃 */
export async function ensureAuthOnBoot(): Promise<void> {
  const at = getAccessToken();
  if (!at) return;

  if (isTokenExpired(at)) {
    const ok = await tryRefresh();
    if (!ok) clearTokens();
  }
}
