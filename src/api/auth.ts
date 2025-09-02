// src/api/auth.ts
import { api } from './http';
import { saveTokens, clearTokens } from '../auth/tokenStore';
import { clearMyInfoCache } from './user';

type LoginResp = {
  accessToken: string;
  refreshToken?: string;
};

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  const payload = (res.data?.payload ?? res.data) as LoginResp;

  if (payload?.accessToken) {
    saveTokens(payload.accessToken, payload.refreshToken);
  }
  return payload;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch (e) {
    console.warn('[logout] ignore error:', e);
  } finally {
    clearTokens();
    clearMyInfoCache();
  }
}
