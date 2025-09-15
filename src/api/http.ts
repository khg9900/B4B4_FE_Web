// src/api/http.ts
import axios, { type AxiosError } from 'axios';
import {
  loadTokensFromStorage,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  isAccessTokenExpired,
} from '../auth/tokenStore';

loadTokensFromStorage();

let onAuthFail: (() => void) | null = null;
export function setAuthFailHandler(fn: () => void) {
  onAuthFail = fn;
}

export const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

const AUTH_EXCLUDE = [/^\/auth\/login$/, /^\/auth\/refresh$/, /^\/auth\/reissue$/, /^\/auth\/signup$/];

function isAuthExcluded(url?: string) {
  if (!url) return false;
  const path = url.split('?')[0];
  return AUTH_EXCLUDE.some((re) => re.test(path));
}

let isRefreshing = false;
let waiters: Array<(token: string | null, err?: any) => void> = [];

async function reissue(): Promise<string> {
  const rt = getRefreshToken();
  if (!rt) throw new Error('no refresh token');

  const resp = await axios.post('/api/auth/reissue', { refreshToken: rt });
  const payload: any = resp.data?.payload ?? resp.data;
  const newAT: string | undefined = payload?.accessToken;
  const newRT: string | undefined = payload?.refreshToken;

  if (!newAT) throw new Error('no access token in reissue response');
  saveTokens(newAT, newRT);
  return newAT;
}

async function ensureValidToken(): Promise<string> {
  const at = getAccessToken();
  if (!at) throw new Error('no access token');

  if (!isAccessTokenExpired(5)) return at;

  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      waiters.push((t, err) => (t ? resolve(t) : reject(err)));
    });
  }

  try {
    isRefreshing = true;
    const newAT = await reissue();
    waiters.forEach((cb) => cb(newAT));
    waiters = [];
    return newAT;
  } catch (e) {
    clearTokens();
    waiters.forEach((cb) => cb(null, e));
    waiters = [];
    onAuthFail?.();
    throw e;
  } finally {
    isRefreshing = false;
  }
}

api.interceptors.request.use(async (config) => {
  if (isAuthExcluded(config.url)) return config;

  const at = getAccessToken();
  if (!at) return config;

  try {
    const validAT = await ensureValidToken();
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${validAT}`;
  } catch {
    /* onAuthFail 내에서 처리 */
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status;
    const original: any = err.config;

    if (!original || isAuthExcluded(original?.url)) {
      return Promise.reject(err);
    }

    if (status === 401 && !original.__isRetryRequest) {
      try {
        const newAT = await ensureValidToken();
        original.__isRetryRequest = true;
        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${newAT}`;
        return api.request(original);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return Promise.reject(err);
  }
);
