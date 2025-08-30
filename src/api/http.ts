// src/api/http.ts
import axios, { AxiosError } from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  loadTokensFromStorage,
} from '../auth/tokenStore';

loadTokensFromStorage();

export const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// 인증 제외 경로(Authorization 헤더를 붙이면 안 되는 API)
const AUTH_EXCLUDE = [
  /^\/auth\/login$/,
  /^\/auth\/refresh$/,
  /^\/auth\/reissue$/,
  /^\/auth\/signup$/,
];

// url에서 경로만 떼고 예외 여부 판단
function isAuthExcluded(url?: string) {
  if (!url) return false;
  const path = url.split('?')[0];
  return AUTH_EXCLUDE.some((re) => re.test(path));
}

// ── Request ───────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  // 로그인/리프레시 등은 헤더 붙이지 않음
  if (!isAuthExcluded(config.url)) {
    const at = getAccessToken();
    if (at) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${at}`;
    }
  }
  return config;
});

// ── Response ──────────────────────────────────────────────────────────
let isRefreshing = false;
let waiters: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const status = err.response?.status;
    const original: any = err.config;

    // 재발급 요청 자체거나 인증 제외 경로면 스킵
    if (!original || isAuthExcluded(original.url)) {
      return Promise.reject(err);
    }

    if (status === 401 && !original.__isRetryRequest) {
      const rt = getRefreshToken();
      if (!rt) {
        clearTokens();
        return Promise.reject(err);
      }

      // 동시에 여러 401이 들어오면 첫 요청만 리프레시하고 나머지는 대기
      if (isRefreshing) {
        return new Promise((resolve) => {
          waiters.push((newAT) => {
            original.__isRetryRequest = true;
            original.headers = original.headers ?? {};
            (original.headers as any).Authorization = `Bearer ${newAT}`;
            resolve(api.request(original));
          });
        });
      }

      try {
        isRefreshing = true;

        // ★ 주의: 재발급은 api가 아닌 기본 axios로 호출(Authorization 헤더 방지)
        const refreshResp = await axios.post('/api/auth/reissue', { refreshToken: rt });
        const payload: any = refreshResp.data?.payload ?? refreshResp.data;
        const newAT: string | undefined = payload?.accessToken;
        const newRT: string | undefined = payload?.refreshToken;

        if (!newAT) {
          clearTokens();
          return Promise.reject(err);
        }

        saveTokens(newAT, newRT);

        // 대기중인 요청 재시도
        waiters.forEach((cb) => cb(newAT));
        waiters = [];

        // 원 요청 재시도
        original.__isRetryRequest = true;
        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${newAT}`;
        return api.request(original);
      } catch (e) {
        clearTokens();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);
