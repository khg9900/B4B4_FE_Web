import { api } from './http';
import { toDetail, toUpdateRequest } from '../adapters/volunteer';
import type {
  DetailPost,
  CreatePostRequest,
  MyPostQuery,
  TeamStatus,
  ListPost,
} from '../types/volunteer';

function unwrap<T>(res: any): T {
  return res?.data?.payload ?? res?.data?.data ?? res?.data ?? res;
}

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
    appliedCount: Number(p.currentParticipants ?? 0),
    recruitmentStartDate: String(p.recruitmentStartDate),
    recruitmentEndDate: String(p.recruitmentEndDate),
    status:
      p.status === 'OPEN' ? '모집 중' :
      p.status === 'CLOSED' ? '모집 마감' : '봉사 완료',
  };
}

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

export async function fetchPosts(params: any = {}) {
  const res = await api.get('/posts', { params });
  const slice = unwrap<any>(res);
  const content = Array.isArray(slice?.content) ? slice.content : [];
  return {
    content: content.map(mapPostTotalToListPost),
    page: Number(slice?.number ?? slice?.page ?? 0),
    size: Number(slice?.size ?? params.size ?? 20),
    hasNext: Boolean(slice?.hasNext ?? (typeof slice?.last === 'boolean' ? !slice.last : false)),
  };
}

export async function fetchPostDetail(id: number): Promise<DetailPost> {
  const res = await api.get(`/posts/${id}`);
  const payload = unwrap<any>(res);
  return toDetail(payload);
}

export async function createVolunteerPost(payload: CreatePostRequest) {
  const res = await api.post('/posts', payload);
  return res.status;
}

export async function updateVolunteerPost(id: number, form: DetailPost) {
  const body = toUpdateRequest(form);
  await api.patch(`/posts/${id}`, body);
}

export async function deleteVolunteerPost(id: number) {
  await api.delete(`/posts/${id}`);
}

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

export async function fetchTeamParticipants(
  postId: number,
  teamId: number
): Promise<TeamParticipantsResponse> {
  const res = await api.get(`/posts/${postId}/teams/${teamId}`);
  return unwrap<TeamParticipantsResponse>(res);
}

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
