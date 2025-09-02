// src/adapters/report.ts
import type { ReportDto, SliceResponse } from '../types/report';

export function toSlice(resp: any): SliceResponse<any> {
  const p = resp?.payload ?? resp ?? {};
  const content = Array.isArray(p.content) ? p.content : [];
  const size = typeof p.size === 'number' ? p.size : content.length;
  const page = typeof p.number === 'number' ? p.number : 0;
  const hasNext =
    typeof p.last === 'boolean' ? !p.last :
    typeof p.hasNext === 'boolean' ? p.hasNext : false;

  return { content, page, size, hasNext };
}

export function toReport(s: any): ReportDto {
  return {
    id: Number(s.id),
    reporterId: Number(s.reporterId ?? s.reporter),
    disasterType: s.disasterType,
    description: s.description ?? '',
    imageUrl: s.imageUrl ?? null,
    videoUrl: s.videoUrl ?? null,
    status: s.status,
    province: s.province ?? '',
    city: s.city ?? '',
    locationLat: Number(s.locationLat ?? s.lat ?? 0),
    locationLng: Number(s.locationLng ?? s.lng ?? 0),
    createdAt: typeof s.createdAt === 'string' ? s.createdAt : new Date(s.createdAt).toISOString(),
    updatedAt: typeof s.updatedAt === 'string' ? s.updatedAt : new Date(s.updatedAt ?? s.createdAt).toISOString(),
  };
}
