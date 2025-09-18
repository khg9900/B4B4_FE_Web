// src/api/volunteerPosts.ts
import { api } from './http';
import { toDetail, toUpdateRequest } from '../adapters/volunteer'; // toSliceFromMy 제거
import type {
  DetailPost,
  CreatePostRequest,
  MyPostQuery,
  TeamStatus,
  ListPost, // ← 추가
} from '../types/volunteer';

/* ---------- helpers: 응답 언랩 + 매퍼 ---------- */
function unwrap<T>(res: any): T {
  return res?.data?.payload ?? res?.data?.data ?? res?.data ?? res;
}

// function mapCategoryToKO(c: string): ListPost['category'] {
//   return c === 'RECRUITMENT' ? '봉사활동 모집' : '구호물품 지원';
// }
// function mapStatusToKO(s: string): ListPost['status'] {
//   if (s === 'OPEN') return '모집 중';
//   if (s === 'CLOSED') return '모집 마감';
//   return '봉사 완료';
// }

// 백엔드 PostTotalResponse → 화면 ListPost
function mapPostTotalToListPost(p: any): ListPost {
  return {
    id: Number(p.id),
    title: String(p.title),
    volunteerDate: String(p.volunteerDate),
    location: `${p.province ?? ''} ${p.city ?? ''}`.trim(),
    category:
      p.category === 'RECRUITMENT' ? '봉사활동 모집' :
      p.category === 'SUPPORT' ? '구호물품 지원' :
      (p.category as ListPost['category']),
    totalCapacity: Number(p.totalCapacity ?? 0),
    appliedCount: Number(p.currentParticipants ?? 0), // ← 핵심
    recruitmentStartDate: String(p.recruitmentStartDate),
    recruitmentEndDate: String(p.recruitmentEndDate),
    status:
      p.status === 'OPEN' ? '모집 중' :
      p.status === 'CLOSED' ? '모집 마감' : '봉사 완료',
  };
}

/** 내 글 목록 조회 (Slice<PostTotalResponse>) → { content, page, size, hasNext } */
export async function fetchMyPosts(params: MyPostQuery = {}) {
  const res = await api.get('/posts/my', { params });
  const slice = unwrap<any>(res);
  const content = Array.isArray(slice?.content) ? slice.content : [];
  return {
    content: content.map(mapPostTotalToListPost),
    page: Number(slice?.number ?? slice?.page ?? 0),
    size: Number(slice?.size ?? params.size ?? 20),
    hasNext: Boolean(slice?.hasNext ?? (typeof slice?.last === 'boolean' ? !slice.last : false)),
  };
}

// (신규 추가) 전체 목록: /posts
export async function fetchPosts(params: any = {}) {
  const res = await api.get('/posts', { params });
  const slice = unwrap<any>(res);
  const content = Array.isArray(slice?.content) ? slice.content : [];
  return {
    content: content.map(mapPostTotalToListPost), // ← 동일 매핑
    page: Number(slice?.number ?? slice?.page ?? 0),
    size: Number(slice?.size ?? params.size ?? 20),
    hasNext: Boolean(slice?.hasNext ?? (typeof slice?.last === 'boolean' ? !slice.last : false)),
  };
}

/** 상세 조회 */
export async function fetchPostDetail(id: number): Promise<DetailPost> {
  const res = await api.get(`/posts/${id}`);
  const payload = unwrap<any>(res);
  return toDetail(payload);
}

/** 게시글 생성 */
export async function createVolunteerPost(payload: CreatePostRequest) {
  const res = await api.post('/posts', payload);
  return res.status;
}

/** 게시글 수정 (PATCH /posts/{id}) — Detail(KO) → Update(EN) */
export async function updateVolunteerPost(id: number, form: DetailPost) {
  const body = toUpdateRequest(form);
  await api.patch(`/posts/${id}`, body);
}

/** 게시글 삭제 (DELETE /posts/{id}) */
export async function deleteVolunteerPost(id: number) {
  await api.delete(`/posts/${id}`);
}

/** 팀 현황 조회 (GET /posts/{postId}/teams) */
export async function fetchPostTeams(postId: number): Promise<TeamStatus[]> {
  const res = await api.get(`/posts/${postId}/teams`);
  const payload = unwrap<any>(res);
  const teams = Array.isArray(payload?.teams) ? payload.teams : [];
  return teams
    .map((t: any) => ({
      teamId: Number(t.teamId),
      teamNumber: Number(t.teamNumber),
      maxCapacity: Number(t.maxCapacity),
      currentCount: Number(t.currentCount),
    }))
    .sort((a: TeamStatus, b: TeamStatus) => a.teamNumber - b.teamNumber);
}

/* ====== 아래 기존 추가 API는 변경 없음 ====== */

export type CheckinStatus =
  | 'PARTICIPATED'
  | 'CANCELLED'
  | 'BLACKLISTED'
  | 'PRESENT'
  | 'ABSENT';

export type Participant = {
  participantId: number;
  name: string;
  email: string;
  phone: string;
  status: CheckinStatus;
};

export type TeamParticipantsResponse = {
  teamId: number;
  teamNumber: number;
  participants: Participant[];
};

export type CheckinStatusRequest = {
  status: Extract<CheckinStatus, 'PRESENT' | 'ABSENT'>;
};

// 공통 언랩 유틸(중복 제거 위해 위로 올림)

/** 특정 팀 참여자 리스트 조회 */
export async function fetchTeamParticipants(
  postId: number,
  teamId: number
): Promise<TeamParticipantsResponse> {
  const res = await api.get(`/posts/${postId}/teams/${teamId}`);
  return unwrap<TeamParticipantsResponse>(res);
}

/** 결석 처리된 참여자 출석 상태 변경 */
export async function updateParticipantAttendance(
  postId: number,
  teamId: number,
  participantId: number,
  body: CheckinStatusRequest
): Promise<void> {
  await api.patch(
    `/posts/${postId}/teams/${teamId}/participants/${participantId}`,
    body
  );
}
