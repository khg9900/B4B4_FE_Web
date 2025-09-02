// src/api/user.ts
import { api } from './http';

export type MyInfo = {
  id: number;
  email: string;
  userRole: string;
  nickname: string;
  province: string;
  city: string;
};

/** 원본 API 호출 */
export async function fetchMyInfo(): Promise<MyInfo> {
  const res = await api.get('user/my-info');
  const p = res.data?.payload ?? res.data ?? {};
  return {
    id: Number(p.id),
    email: String(p.email ?? ''),
    userRole: String(p.userRole ?? ''),
    nickname: String(p.nickname ?? ''),
    province: String(p.province ?? ''),
    city: String(p.city ?? ''),
  };
}

/* ── 캐시 ─────────────────────────────────── */
const LS_KEY = 'me:v1';
const STALE_MS = 1000 * 60 * 30; // 30분(원하면 늘리거나 0으로 꺼도 됨)

let mem: { data: MyInfo; at: number } | null = null;

function loadFromLS(): { data: MyInfo; at: number } | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function saveToLS(d: { data: MyInfo; at: number }) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch {}
}

/** 캐시 우선 조회 */
export async function getMyInfoCached(opts?: { force?: boolean }): Promise<MyInfo> {
  const now = Date.now();

  if (!opts?.force) {
    if (mem && now - mem.at < STALE_MS) return mem.data;

    const ls = loadFromLS();
    if (ls && now - ls.at < STALE_MS) {
      mem = ls;
      return ls.data;
    }
  }

  const fresh = await fetchMyInfo();
  mem = { data: fresh, at: now };
  saveToLS(mem);
  return fresh;
}

export function clearMyInfoCache() {
  mem = null;
  try { localStorage.removeItem(LS_KEY); } catch {}
}
