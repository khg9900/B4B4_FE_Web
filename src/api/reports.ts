// src/api/reports.ts
import { api } from './http';
import { toReport, toSlice } from '../adapters/report';
import type { ReportDto, ReportStatusEN, SliceResponse } from '../types/report';

const REPORT_BASE = '/reports';

/** 슬라이스 조회 (페이지/상태/지역별) */
export async function fetchReportsSlice(params: {
  si: string;
  gu: string;
  status?: ReportStatusEN;
  page?: number;
  size?: number;
}): Promise<SliceResponse<ReportDto>> {
  const res = await api.get(`${REPORT_BASE}/slice`, {
    params: { ...params, sort: 'createdAt,desc' },
  });
  const s = toSlice(res.data);
  return { ...s, content: s.content.map(toReport) };
}

/** 상태 변경 PATCH /reports/{id}/status?newStatus=... */
export async function updateReportStatus(id: number, status: ReportStatusEN) {
  const res = await api.patch(`${REPORT_BASE}/${id}/status`, null, {
    params: { newStatus: status },
  });
  return res.data?.payload ?? res.data;
}

/** 오늘 집계 */
export type TodayStats = {
  pending: number;
  received: number;
  closed: number;
};

export async function fetchTodayReportStats(): Promise<TodayStats> {
  const res = await api.get(`${REPORT_BASE}/today`);
  const p = res.data?.payload ?? res.data ?? {};
  return {
    pending: Number(p.pending ?? 0),
    received: Number(p.received ?? 0),
    closed: Number(p.closed ?? 0),
  };
}

/** 히트맵 관련 */
export type DisasterMarker = {
  disasterType: string;   // EARTHQUAKE, FLOOD 등
  status: 'PENDING' | 'RECEIVED' | 'CLOSED';
  count: number;
  latitude: number;
  longitude: number;
};

export const disasterColors: Record<string, string> = {
  EARTHQUAKE: '#FF3B30',
  FLOOD: '#007AFF',
  TYPHOON: '#FF9500',
  WILDFIRE: '#C21807',
  LANDSLIDE: '#8B4513',
  POWER_OUTAGE: '#8E8E93',
  TERROR_ATTACK: '#000000',
  BUILDING_COLLAPSE: '#6A5ACD',
};

/** 위치 기반 마커 조회 */
export async function fetchDisasterMarkers(
  latitude: number,
  longitude: number,
  bounds?: { swLat: number; swLng: number; neLat: number; neLng: number }
): Promise<DisasterMarker[]> {
  const params: Record<string, any> = bounds
    ? {  longitude,latitude, ...bounds }
    : { longitude, latitude };

  try {
    const res = await api.get(`${REPORT_BASE}/map`, { params });
    const payload = res.data?.payload;

    if (Array.isArray(payload)) {
      return payload.map((p: any) => ({
        disasterType: p.disasterType,
        status: p.status,
        count: Number(p.count ?? 0),
        latitude: Number(p.latitude ?? 0),
        longitude: Number(p.longitude ?? 0),
      }));
    }
  } catch (err) {
    console.error('🔥 마커 API 요청 실패:', err);
  }

  return [];
}
