// src/adapters/volunteer.ts
import type {
  PostCategory,
  PostStatus,
  ListPost,
  DetailPost,
  CreatePostRequest,
  UpdatePostRequest,
  PostCategoryEN,
  PostStatusEN,
} from '../types/volunteer';

/** 표시용 문자열 */
const joinLocation = (province?: string, city?: string) =>
  [province, city].filter(Boolean).join(' ');

/** EN ↔ KO 매핑 (서버 ↔ 화면) */
const CAT_EN_TO_KO: Record<string, PostCategory> = {
  RECRUITMENT: '봉사활동 모집',
  SUPPORT: '구호물품 지원',
};
const CAT_KO_TO_EN: Record<PostCategory, PostCategoryEN> = {
  '봉사활동 모집': 'RECRUITMENT',
  '구호물품 지원': 'SUPPORT',
};

const STAT_EN_TO_KO: Record<string, PostStatus> = {
  OPEN: '모집 중',
  CLOSED: '모집 마감',
  COMPLETED: '봉사 완료',
};
const STAT_KO_TO_EN: Record<PostStatus, PostStatusEN> = {
  '모집 중': 'OPEN',
  '모집 마감': 'CLOSED',
  '봉사 완료': 'COMPLETED',
};

/** ───────── 목록(내 글) → 테이블 행 ───────── */
export function toListPostFromMy(s: any): ListPost {
  return {
    id: Number(s.id),
    title: s.title ?? '',
    volunteerDate: s.volunteerDate ?? '',
    location: joinLocation(s.province, s.city),
    category: CAT_EN_TO_KO[s.category] ?? (s.category as PostCategory),
    appliedCount: Number(s.appliedCount ?? 0),
    totalCapacity: Number(s.totalCapacity ?? 0),
    recruitmentStartDate: s.recruitmentStartDate ?? '',
    recruitmentEndDate: s.recruitmentEndDate ?? '',
    status: STAT_EN_TO_KO[s.status] ?? (s.status as PostStatus),
  };
}

/** ───────── Slice 래핑 해제 (page/size/hasNext) ───────── */
export function toSliceFromMy<T = any>(resp: any): {
  content: T[];
  page: number;     // 0-based
  size: number;
  hasNext: boolean; // 다음 페이지 존재 여부
} {
  const p = (resp && resp.payload) ?? resp ?? {};
  const content = Array.isArray(p.content) ? p.content : [];
  const page = typeof p.number === 'number' ? p.number : 0; // 0-based
  const size = typeof p.size === 'number' ? p.size : content.length;

  // Spring Slice: hasNext 없으면 last로 유추
  const hasNext =
    typeof p.hasNext === 'boolean'
      ? p.hasNext
      : typeof p.last === 'boolean'
        ? !p.last
        : false;

  return { content, page, size, hasNext };
}

/** ISO → 'HH:mm' */
const toHHmm = (iso?: string | null) =>
  iso && typeof iso === 'string' && iso.length >= 16 ? iso.substring(11, 16) : (iso ?? '');

/** ───────── 상세 응답 → 화면 모델 ───────── */
export function toDetail(s: any): DetailPost {
  const loc = s.location && typeof s.location === 'object' ? s.location : {};
  const att = s.attendancePolicy && typeof s.attendancePolicy === 'object' ? s.attendancePolicy : {};

  const province = s.province ?? loc.province;
  const city = s.city ?? loc.city;

  const attendanceStartTime =
    s.attendanceStartTime ?? (att.checkinStart ? toHHmm(att.checkinStart) : '');
  const attendanceEndTime =
    s.attendanceEndTime ?? (att.checkinEnd ? toHHmm(att.checkinEnd) : '');
  const attendanceRadius =
    s.attendanceRadius ?? att.allowedRadiusM ?? 0;

  return {
    id: Number(s.id ?? 0),
    title: s.title ?? '',
    content: s.content ?? '',
    category: CAT_EN_TO_KO[s.category] ?? (s.category as PostCategory) ?? '봉사활동 모집',
    status: STAT_EN_TO_KO[s.status] ?? (s.status as PostStatus) ?? '모집 중',
    province: province ?? '',
    city: city ?? null,
    volunteerDate: s.volunteerDate ?? '',
    volunteerStartTime: s.volunteerStartTime ?? '',
    volunteerEndTime: s.volunteerEndTime ?? '',

    recruitmentStartDate: s.recruitmentStartDate ?? '',
    recruitmentEndDate: s.recruitmentEndDate ?? '',

    location: joinLocation(province, city),
    placeName: s.placeName ?? loc.placeName ?? '',
    latitude: s.latitude ?? loc.latitude ?? null,
    longitude: s.longitude ?? loc.longitude ?? null,

    totalCapacity: Number(s.totalCapacity ?? s.capacity ?? 0),
    appliedCount: Number(s.appliedCount ?? 0),

    attendanceStartTime,
    attendanceEndTime,
    attendanceRadius,
    minAttendanceMinutes: Number(s.minAttendanceMinutes ?? 0),

    teamCount: Number(s.teamCount ?? 0),
    perTeamCapacity: Number(s.perTeamCapacity ?? s.teamSize ?? 0),
  };
}

/** 'YYYY-MM-DD' + 'HH:mm' → 'YYYY-MM-DDTHH:mm:00' */
const toISODateTime = (date: string, hhmm?: string) => {
  const t = hhmm && /^\d{2}:\d{2}$/.test(hhmm) ? `${hhmm}:00` : '00:00:00';
  return `${date}T${t}`;
};

/** 'HH:mm' -> 'HH:mm:ss' */
const toHHmmss = (t?: string | null) => {
  if (!t) return null;
  return /^\d{2}:\d{2}$/.test(t) ? `${t}:00` : t;
};

/** "시/도 구/군" → { province, city } */
function parseRegion(region1: string, region2: string): { province: string; city: string | null } {
  let province = region1;
  let city: string | null = region2;
  if (region1 === '세종특별자치시') city = null;
  else if (region2.endsWith('군')) city = region2;
  return { province, city };
}

/** ───────── 등록: 화면(KO) → 서버(Create, EN) ───────── */
export function toCreateRequest(
  form: DetailPost & { province?: string; city?: string }
): CreatePostRequest {
  const teamSize =
    form.perTeamCapacity && form.perTeamCapacity > 0
      ? form.perTeamCapacity
      : form.teamCount && form.teamCount > 0
        ? Math.floor(form.totalCapacity / form.teamCount)
        : 0;

  if (!teamSize || form.totalCapacity % teamSize !== 0) {
    throw new Error('전체 인원은 팀 정원으로 정확히 나누어 떨어져야 합니다.');
  }

  const category = CAT_KO_TO_EN[form.category];

  return {
    title: form.title,
    content: form.content,
    volunteerDate: form.volunteerDate,
    volunteerStartTime: toHHmmss(form.volunteerStartTime) ?? '00:00:00',
    volunteerEndTime:
      toHHmmss(form.volunteerEndTime) ??
      toHHmmss(form.volunteerStartTime) ??
      '00:00:00',
    recruitmentStartDate: form.recruitmentStartDate,
    recruitmentEndDate: form.recruitmentEndDate,
    totalCapacity: form.totalCapacity,
    teamSize,
    category,

    location: {
      province: form.province ?? '',
      city: form.city ?? '',
      placeName: form.placeName ?? '',
      latitude: form.latitude ?? 0,
      longitude: form.longitude ?? 0,
    },

    attendancePolicy: {
      checkinStart: toISODateTime(form.volunteerDate, form.attendanceStartTime),
      checkinEnd: toISODateTime(form.volunteerDate, form.attendanceEndTime),
      allowedRadiusM: form.attendanceRadius ?? 0,
    },
  };
}

/** ───────── 수정: 화면(KO) → 서버(Update, EN) ───────── */
export function toUpdateRequest(form: DetailPost): UpdatePostRequest {
   const { province, city } = parseRegion(form.location?.split(' ')[0] ?? '', form.location?.split(' ').slice(1).join(' ') ?? '');

  return {
    title: form.title,
    content: form.content,

    volunteerDate: form.volunteerDate,
    volunteerStartTime: toHHmmss(form.volunteerStartTime) ?? '00:00:00',
    volunteerEndTime:
      toHHmmss(form.volunteerEndTime) ??
      toHHmmss(form.volunteerStartTime) ??
      '00:00:00',

    recruitmentStartDate: form.recruitmentStartDate,
    recruitmentEndDate: form.recruitmentEndDate,

    status: STAT_KO_TO_EN[form.status as PostStatus] as PostStatusEN,

    location: {
      province: province ?? '',
      city: city ?? '',
      placeName: form.placeName ?? '',
      latitude: form.latitude ?? 0,
      longitude: form.longitude ?? 0,
    },

    attendancePolicy: {
      checkinStart: toISODateTime(form.volunteerDate, form.attendanceStartTime),
      checkinEnd: toISODateTime(form.volunteerDate, form.attendanceEndTime),
      allowedRadiusM: form.attendanceRadius ?? 0,
    },
  };
}

/** (옵션) 외부에서 쓸 수 있게 매핑 export */
export const Mapping = {
  CAT_EN_TO_KO,
  CAT_KO_TO_EN,
  STAT_EN_TO_KO,
  STAT_KO_TO_EN,
};
