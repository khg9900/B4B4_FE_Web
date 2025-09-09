//volunteer.ts
// === 화면 라벨(한글) ===
export type PostCategory = '봉사활동 모집' | '구호물품 지원';
export type PostStatus   = '모집 중' | '모집 마감' | '봉사 완료';

export const POST_CATEGORIES: PostCategory[] = ['봉사활동 모집', '구호물품 지원'];
export const POST_STATUS: PostStatus[] = ['모집 중', '모집 마감', '봉사 완료'];

// === 목록 테이블 행 ===
export interface ListPost {
  id: number;
  title: string;
  volunteerDate: string;        // YYYY-MM-DD
  location: string;             // "서울특별시 강남구"
  category: PostCategory;
  totalCapacity: number;        // PostTotalResponse.totalCapacity
  appliedCount: number;         // PostTotalResponse.currentParticipants
  recruitmentStartDate: string; // YYYY-MM-DD
  recruitmentEndDate: string;   // YYYY-MM-DD
  status: PostStatus;
}

// === 상세/등록 공용(폼) 모델 ===
export interface DetailPost {
  id?: number;
  title: string;
  content: string;
  category: PostCategory;
  status: PostStatus;

  volunteerDate: string;          // YYYY-MM-DD
  volunteerStartTime?: string;    // HH:mm
  volunteerEndTime?: string;      // HH:mm

  recruitmentStartDate: string;   // YYYY-MM-DD
  recruitmentEndDate: string;     // YYYY-MM-DD

  // 화면 표시는 문자열 "시/도 구/군"
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

  attendanceStartTime?: string;   // HH:mm
  attendanceEndTime?: string;     // HH:mm
  attendanceRadius?: number;      // m
  minAttendanceMinutes?: number;  // 분 (생성에는 사용 안 함)
}

// === 페이지 공용 응답 ===
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// === 서버 ENUM 코드(영문) ===
export type PostCategoryEN = 'RECRUITMENT' | 'SUPPORT';
export type PostStatusEN   = 'OPEN' | 'CLOSED' | 'COMPLETED';

// === 생성 요청 DTO (백엔드 CreatePostRequest 매칭) ===
export interface CreatePostRequest {
  title: string;
  content: string;
  volunteerDate: string;           // YYYY-MM-DD
  volunteerStartTime: string;      // HH:mm:ss
  volunteerEndTime: string;        // HH:mm:ss
  recruitmentStartDate: string;    // YYYY-MM-DD
  recruitmentEndDate: string;      // YYYY-MM-DD
  totalCapacity: number;
  teamSize: number;                // totalCapacity % teamSize === 0
  category: PostCategoryEN;
  location: {
    province: string;
    city: string;
    placeName: string;
    latitude: number;
    longitude: number;
  };
  attendancePolicy: {
    checkinStart: string;          // ISO: 2025-09-01T09:00:00
    checkinEnd: string;            // ISO: 2025-09-01T10:00:00
    allowedRadiusM: number;
  };
}

// === 수정 요청 DTO (백엔드 UpdatePostRequest 매칭) ===
export interface UpdatePostRequest {
  title: string;
  content: string;

  volunteerDate: string;        // YYYY-MM-DD
  volunteerStartTime: string;   // HH:mm:ss
  volunteerEndTime: string;     // HH:mm:ss

  recruitmentStartDate: string; // YYYY-MM-DD
  recruitmentEndDate: string;   // YYYY-MM-DD

  status: PostStatusEN;

  location?: {
    province: string;
    city: string;
    placeName?: string;
    latitude?: number;
    longitude?: number;
  };

  attendancePolicy?: {
    checkinStart: string;        // ISO
    checkinEnd: string;          // ISO
    allowedRadiusM: number;
  };
}

// === 내 글 조회 쿼리(백엔드 필터와 동일, 서버로 EN 코드 전달) ===
export interface MyPostQuery {
  page?: number;
  size?: number;
  province?: string;
  city?: string;
  status?: PostStatusEN;
  category?: PostCategoryEN;
  volunteerStartDate?: string;  // YYYY-MM-DD
  volunteerEndDate?: string;    // YYYY-MM-DD
}

// === 팀 상태(상세 하단 표) ===
export interface TeamStatus {
  teamId: number;
  teamNumber: number;   // 1,2,3...
  maxCapacity: number;  // 팀 정원
  currentCount: number; // 현재 신청 인원
}

export interface PostTeamsResponse {
  postId: number;
  teams: TeamStatus[];
}