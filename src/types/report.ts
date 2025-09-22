export type DisasterTypeEN =
  | 'EARTHQUAKE'
  | 'FLOOD'
  | 'TYPHOON'
  | 'WILDFIRE'
  | 'LANDSLIDE'
  | 'POWER_OUTAGE'
  | 'TERROR_ATTACK'
  | 'BUILDING_COLLAPSE';

export type ReportStatusEN = 'PENDING' | 'RECEIVED' | 'CLOSED';

export interface ReportDto {
  id: number;
  reporterId: number;
  disasterType: DisasterTypeEN;
  description: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  status: ReportStatusEN;
  province: string;
  city: string;
  locationLat: number;
  locationLng: number;
  createdAt: string;
  updatedAt: string;
}

export interface SliceResponse<T> {
  content: T[];
  page: number;
  size: number;
  hasNext: boolean;
}

export const DISASTER_TYPE_KO: Record<DisasterTypeEN, string> = {
  EARTHQUAKE: '지진',
  FLOOD: '홍수',
  TYPHOON: '태풍',
  WILDFIRE: '산불',
  LANDSLIDE: '산사태',
  POWER_OUTAGE: '정전',
  TERROR_ATTACK: '테러',
  BUILDING_COLLAPSE: '건물 붕괴',
};

export const REPORT_STATUS_KO: Record<ReportStatusEN, string> = {
  PENDING: '접수대기',
  RECEIVED: '접수완료',
  CLOSED: '상황종료',
};
