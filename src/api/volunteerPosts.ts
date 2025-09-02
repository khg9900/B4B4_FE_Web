import { api } from './http';
import { toPageFromMy, toDetail, toUpdateRequest } from '../adapters/volunteer';
import type {
  DetailPost,
  CreatePostRequest,
  MyPostQuery,
  TeamStatus
} from '../types/volunteer';

/** 내 글 목록 조회 */
export async function fetchMyPosts(params: MyPostQuery = {}) {
  const res = await api.get('/post/my', { params });
  return toPageFromMy(res.data);
}

/** 상세 조회 */
export async function fetchPostDetail(id: number): Promise<DetailPost> {
  const res = await api.get(`/post/${id}`);
  const payload = res.data?.payload ?? res.data;
  return toDetail(payload);
}

/** 게시글 생성 */
export async function createVolunteerPost(payload: CreatePostRequest) {
  const res = await api.post('/post', payload);
  return res.status;
}

/** 게시글 수정 (PATCH /post/{id}) — DetailPost(KO) → UpdatePostRequest(EN) 내부 변환 */
export async function updateVolunteerPost(id: number, form: DetailPost) {
  const body = toUpdateRequest(form);
  await api.patch(`/post/${id}`, body);
}

/** 팀 현황 조회 (GET /post/{postId}/teams) */
export async function fetchPostTeams(postId: number): Promise<TeamStatus[]> {
  const res = await api.get(`/post/${postId}/teams`);
  const payload = res.data?.payload ?? res.data;
  const teams = Array.isArray(payload?.teams) ? payload.teams : [];
  // 정렬(팀 번호 오름차순) 및 안전 매핑
  return teams
    .map((t: any) => ({
      teamId: Number(t.teamId),
      teamNumber: Number(t.teamNumber),
      maxCapacity: Number(t.maxCapacity),
      currentCount: Number(t.currentCount),
    }))
    .sort((a: TeamStatus, b: TeamStatus) => a.teamNumber - b.teamNumber);
}
/* ====== 추가 코드 (신규 API 및 타입) ====== */

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
  status: CheckinStatus; // PRESENT | ABSENT | ...
};

export type TeamParticipantsResponse = {
  teamId: number;
  teamNumber: number;
  participants: Participant[];
};

export type CheckinStatusRequest = {
  status: Extract<CheckinStatus, 'PRESENT' | 'ABSENT'>;
};

// 공통 언랩 유틸
function unwrap<T>(res: any): T {
  return res?.data?.payload ?? res?.data?.data ?? res?.data ?? res;
}

/**
 * 특정 팀 참여자 리스트 조회
 * GET /posts/{postId}/teams/{teamId}
 * 백엔드: VolunteerAttendanceController.getTeamList
 */
export async function fetchTeamParticipants(
  postId: number,
  teamId: number
): Promise<TeamParticipantsResponse> {
  const res = await api.get(`/posts/${postId}/teams/${teamId}`);
  return unwrap<TeamParticipantsResponse>(res);
}

/**
 * 결석 처리된 참여자 출석 상태 변경
 * PATCH /posts/{postId}/teams/{teamId}/volunteer-participants/{participantId}
 * body: { status: 'PRESENT' | 'ABSENT' }
 * 백엔드: VolunteerAttendanceController.patchAttendance
 */
export async function updateParticipantAttendance(
  postId: number,
  teamId: number,
  participantId: number,
  body: CheckinStatusRequest
): Promise<void> {
  await api.patch(
    `/posts/${postId}/teams/${teamId}/volunteer-participants/${participantId}`,
    body
  );
}