// src/api/http.ts
import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  loadTokensFromStorage,
} from '../auth/tokenStore';

loadTokensFromStorage();

/** 재발급 실패 시 라우터로 이동시키기 위한 콜백 (App에서 주입) */
let onAuthFail: (() => void) | null = null;
export function setAuthFailHandler(fn: () => void) {
  onAuthFail = fn;
}

/** 공용 API 클라이언트 */
export const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

/** 인증 제외 경로(Authorization 헤더를 붙이면 안 되는 API) */
const AUTH_EXCLUDE = [
  /^\/auth\/login$/,
  /^\/auth\/refresh$/,
  /^\/auth\/reissue$/,
  /^\/auth\/signup$/,
];

function isAuthExcluded(url?: string) {
  if (!url) return false;
  const path = url.split('?')[0];
  return AUTH_EXCLUDE.some((re) => re.test(path));
}

let isRefreshing = false;
let waiters: Array<(token: string | null, error?: any) => void> = [];

/* ─ Request ─ */
api.interceptors.request.use((config) => {
  if (!isAuthExcluded(config.url)) {
    const at = getAccessToken();
    if (at) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${at}`;
    }
  }
  return config;
});

/* ─ Response ─ */
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status;
    const original = err.config as (AxiosRequestConfig & { __isRetryRequest?: boolean }) | undefined;

    if (!original || isAuthExcluded(original.url)) {
      return Promise.reject(err);
    }

    if (status === 401 && !original.__isRetryRequest) {
      const rt = getRefreshToken();
      if (!rt) {
        clearTokens();
        if (onAuthFail) onAuthFail();
        else window.location.assign('/login');
        return Promise.reject(err);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          waiters.push((newAT, error) => {
            if (newAT) {
              original.__isRetryRequest = true;
              original.headers = original.headers ?? {};
              (original.headers as any).Authorization = `Bearer ${newAT}`;
              resolve(api.request(original));
            } else {
              reject(error ?? err);
            }
          });
        });
      }

      try {
        isRefreshing = true;

        // 재발급은 기본 axios로 (Authorization 자동첨부 방지)
        const refreshResp = await axios.post('/api/auth/reissue', { refreshToken: rt });
        const payload: any = refreshResp.data?.payload ?? refreshResp.data;
        const newAT: string | undefined = payload?.accessToken;
        const newRT: string | undefined = payload?.refreshToken;

        if (!newAT) throw new Error('No accessToken in reissue response');

        saveTokens(newAT, newRT);

        waiters.forEach((cb) => cb(newAT));
        waiters = [];

        original.__isRetryRequest = true;
        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${newAT}`;
        return api.request(original);
      } catch (e) {
        clearTokens();
        waiters.forEach((cb) => cb(null, e));
        waiters = [];
        if (onAuthFail) onAuthFail();
        else window.location.assign('/login');
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);
