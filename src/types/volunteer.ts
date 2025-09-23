export type PostCategory = '봉사활동 모집' | '구호물품 지원';
export type PostStatus   = '모집 중' | '모집 마감' | '봉사 완료';

export const POST_CATEGORIES: PostCategory[] = ['봉사활동 모집', '구호물품 지원'];
export const POST_STATUS: PostStatus[] = ['모집 중', '모집 마감', '봉사 완료'];

export interface ListPost {
  id: number;
  title: string;
  volunteerDate: string;
  location: string;
  category: PostCategory;
  totalCapacity: number;
  appliedCount: number;
  recruitmentStartDate: string;
  recruitmentEndDate: string;
  status: PostStatus;
}

export interface DetailPost {
  id?: number;
  title: string;
  content: string;
  category: PostCategory;
  status: PostStatus;

  volunteerDate: string;
  volunteerStartTime?: string;
  volunteerEndTime?: string;

  recruitmentStartDate: string;
  recruitmentEndDate: string;

  location: string;
  province: string;
  city?: string | null;
  placeName?: string;
  latitude?: number | null;
  longitude?: number | null;

  totalCapacity: number;
  appliedCount?: number;
  teamCount?: number;
  perTeamCapacity?: number;

  attendanceStartTime?: string;
  attendanceEndTime?: string;
  attendanceRadius?: number;
  minAttendanceMinutes?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export type PostCategoryEN = 'RECRUITMENT' | 'SUPPORT';
export type PostStatusEN   = 'OPEN' | 'CLOSED' | 'COMPLETED';

export interface CreatePostRequest {
  title: string;
  content: string;
  volunteerDate: string;
  volunteerStartTime: string;
  volunteerEndTime: string;
  recruitmentStartDate: string;
  recruitmentEndDate: string;
  totalCapacity: number;
  teamSize: number;
  category: PostCategoryEN;
  location: {
    province: string;
    city: string;
    placeName: string;
    latitude: number;
    longitude: number;
  };
  attendancePolicy: {
    checkinStart: string;
    checkinEnd: string;
    allowedRadiusM: number;
  };
}

export interface UpdatePostRequest {
  title: string;
  content: string;

  volunteerDate: string;
  volunteerStartTime: string;
  volunteerEndTime: string;

  recruitmentStartDate: string;
  recruitmentEndDate: string;

  status: PostStatusEN;

  location?: {
    province: string;
    city: string;
    placeName?: string;
    latitude?: number;
    longitude?: number;
  };

  attendancePolicy?: {
    checkinStart: string;
    checkinEnd: string;
    allowedRadiusM: number;
  };
}

export interface MyPostQuery {
  page?: number;
  size?: number;
  province?: string;
  city?: string;
  status?: PostStatusEN;
  category?: PostCategoryEN;
  volunteerStartDate?: string;
  volunteerEndDate?: string;
}

export interface TeamStatus {
  teamId: number;
  teamNumber: number;
  maxCapacity: number;
  currentCount: number;
}

export interface PostTeamsResponse {
  postId: number;
  teams: TeamStatus[];
}