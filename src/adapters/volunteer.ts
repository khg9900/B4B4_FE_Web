// src/adapters/volunteer.ts
import type {
  PostCategory,
  PostStatus,
  ListPost,
  DetailPost,
  PageResponse,
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
    id: s.id,
    title: s.title,
    volunteerDate: s.volunteerDate,
    location: joinLocation(s.province, s.city),
    category: CAT_EN_TO_KO[s.category] ?? (s.category as PostCategory),
    totalCapacity: s.totalCapacity,
    recruitmentStartDate: s.recruitmentStartDate,
    recruitmentEndDate: s.recruitmentEndDate,
    status: STAT_EN_TO_KO[s.status] ?? (s.status as PostStatus),
  };
}

/** ───────── 페이지/슬라이스 래핑 해제 ───────── */
export function toPageFromMy<T = any>(resp: any): PageResponse<T> {
  const p = resp?.payload ?? {};
  const content = Array.isArray(p.content) ? p.content : [];
  const size = typeof p.size === 'number' ? p.size : content.length;
  const totalElements =
    typeof p.totalElements === 'number' ? p.totalElements : content.length;
  const totalPages =
    typeof p.totalPages === 'number'
      ? p.totalPages
      : size > 0
        ? Math.max(1, Math.ceil(totalElements / size))
        : (p.last ? (p.number ?? 0) + 1 : (p.number ?? 0) + 1);

  return { content, totalElements, totalPages, page: p.number ?? 0, size };
}

/** ISO → 'HH:mm' */
const toHHmm = (iso?: string | null) =>
  iso && typeof iso === 'string' && iso.length >= 16 ? iso.substring(11, 16) : (iso ?? '');

/** ───────── 상세 응답 → 화면 모델 ─────────
 * 서버 응답이 location/attendancePolicy를 중첩 객체로 주는 경우와
 * 평면 필드로 주는 경우를 모두 대응.
 */
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
    id: s.id ?? 0,
    title: s.title ?? '',
    content: s.content ?? '',
    category: CAT_EN_TO_KO[s.category] ?? (s.category as PostCategory) ?? '봉사활동 모집',
    status:   STAT_EN_TO_KO[s.status]   ?? (s.status   as PostStatus)   ?? '모집 중',

    volunteerDate: s.volunteerDate ?? '',
    volunteerStartTime: s.volunteerStartTime ?? '',
    volunteerEndTime: s.volunteerEndTime ?? '',

    recruitmentStartDate: s.recruitmentStartDate ?? '',
    recruitmentEndDate: s.recruitmentEndDate ?? '',

    location: joinLocation(province, city),
    placeName: s.placeName ?? loc.placeName ?? '',
    latitude: s.latitude ?? loc.latitude ?? null,
    longitude: s.longitude ?? loc.longitude ?? null,

    totalCapacity: s.totalCapacity ?? s.capacity ?? 0,
    appliedCount: s.appliedCount ?? 0,

    attendanceStartTime,
    attendanceEndTime,
    attendanceRadius,
    minAttendanceMinutes: s.minAttendanceMinutes ?? 0,

    teamCount: s.teamCount ?? 0,
    perTeamCapacity: s.perTeamCapacity ?? s.teamSize ?? 0,
  };
}

/** 'YYYY-MM-DD' + 'HH:mm' → 'YYYY-MM-DDTHH:mm:00' */
const toISODateTime = (date: string, hhmm?: string) => {
  const t = (hhmm && /^\d{2}:\d{2}$/.test(hhmm)) ? `${hhmm}:00` : '00:00:00';
  return `${date}T${t}`;
};

/** 'HH:mm' -> 'HH:mm:ss' (LocalTime 안전 변환) */
const toHHmmss = (t?: string | null) => {
  if (!t) return null;
  return /^\d{2}:\d{2}$/.test(t) ? `${t}:00` : t;
};

/** "시/도 구/군" → { province, city } */
const splitProvinceCity = (location?: string) => {
  if (!location) return { province: null, city: null };
  const [province, city] = location.trim().split(/\s+/, 2);
  return { province: province ?? null, city: city ?? null };
};

/** ───────── 등록: 화면(DetailPost, KO) → 서버(CreatePostRequest, EN) ───────── */
export function toCreateRequest(
  form: DetailPost & { province?: string; city?: string }
): CreatePostRequest {
  const teamSize = form.perTeamCapacity && form.perTeamCapacity > 0
    ? form.perTeamCapacity
    : (form.teamCount && form.teamCount > 0 ? Math.floor(form.totalCapacity / form.teamCount) : 0);

  if (!teamSize || form.totalCapacity % teamSize !== 0) {
    throw new Error('전체 인원은 팀 정원으로 정확히 나누어 떨어져야 합니다.');
  }

  const category = CAT_KO_TO_EN[form.category];

  return {
    title: form.title,
    content: form.content,
    volunteerDate: form.volunteerDate,
    volunteerStartTime: toHHmmss(form.volunteerStartTime) ?? '00:00:00',
    volunteerEndTime: toHHmmss(form.volunteerEndTime) ?? toHHmmss(form.volunteerStartTime) ?? '00:00:00',
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
      checkinEnd:   toISODateTime(form.volunteerDate, form.attendanceEndTime),
      allowedRadiusM: form.attendanceRadius ?? 0,
    },
  };
}

/** ───────── 수정: 화면(DetailPost, KO) → 서버(UpdatePostRequest, EN) ───────── */
export function toUpdateRequest(form: DetailPost): UpdatePostRequest {
  const { province, city } = splitProvinceCity(form.location);

  return {
    title: form.title,
    content: form.content,

    volunteerDate: form.volunteerDate,
    volunteerStartTime: toHHmmss(form.volunteerStartTime) ?? '00:00:00',
    volunteerEndTime:   toHHmmss(form.volunteerEndTime)   ?? toHHmmss(form.volunteerStartTime) ?? '00:00:00',

    recruitmentStartDate: form.recruitmentStartDate,
    recruitmentEndDate:   form.recruitmentEndDate,

    status: STAT_KO_TO_EN[form.status as PostStatus] as PostStatusEN,

    // UpdatePostRequest 는 location/attendancePolicy 가 선택일 수 있음. 여기서는 항상 채워서 보냄.
    location: {
      province: province ?? '',
      city: city ?? '',
      placeName: form.placeName ?? '',
      latitude: form.latitude ?? 0,
      longitude: form.longitude ?? 0,
    },

    attendancePolicy: {
      checkinStart: toISODateTime(form.volunteerDate, form.attendanceStartTime),
      checkinEnd:   toISODateTime(form.volunteerDate, form.attendanceEndTime),
      allowedRadiusM: form.attendanceRadius ?? 0,
    },
  };
}

// (필요 시 외부에서 사용할 수 있도록 매핑 export)
export const Mapping = {
  CAT_EN_TO_KO,
  CAT_KO_TO_EN,
  STAT_EN_TO_KO,
  STAT_KO_TO_EN,
};
