import { api } from './http';
import { saveTokens, clearTokens } from '../auth/tokenStore';
import { clearMyInfoCache } from './user';

type LoginResp = {
  accessToken: string;
  refreshToken?: string;
};

export type UserRole = 'GOV' | 'NGO';

export type SignUpRequestDto = {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  userRole: UserRole;
  province?: string | null;
  city?: string | null;
};

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  const payload = (res.data?.payload ?? res.data) as LoginResp;

  if (payload?.accessToken) {
    saveTokens(payload.accessToken, payload.refreshToken);
  }
  return payload;
}

export async function signup(body: SignUpRequestDto) {
  const res = await api.post('/auth/signup', body);
  return res.data;
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
