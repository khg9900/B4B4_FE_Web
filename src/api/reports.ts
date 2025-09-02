// src/api/reports.ts
import { api } from './http';
import { toReport, toSlice } from '../adapters/report';
import type { ReportDto, ReportStatusEN, SliceResponse } from '../types/report';

const REPORT_BASE = '/reports';

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

/** 백엔드 스펙: PATCH /reports/{id}/status?newStatus=RECEIVED */
export async function updateReportStatus(id: number, status: ReportStatusEN) {
  const res = await api.patch(`${REPORT_BASE}/${id}/status`, null, {
    params: { newStatus: status },
  });
  return res.data?.payload ?? res.data;
}

/* ===== 오늘 집계 실데이터 ===== */
export type TodayStats = {
  pending: number;   // 접수대기
  received: number;  // 접수완료
  closed: number;    // 상황종료
};

/** GET /reports/today (인증된 GOV 사용자 기준, 오늘 집계) */
export async function fetchTodayReportStats(): Promise<TodayStats> {
  const res = await api.get(`${REPORT_BASE}/today`);
  const p = res.data?.payload ?? res.data ?? {};
  return {
    pending: Number(p.pending ?? 0),
    received: Number(p.received ?? 0),
    closed: Number(p.closed ?? 0),
  };
}
