// src/components/volunteer-form/hooks/useVolunteerForm.ts
import { useState, useMemo } from 'react';
import type { PostCategory } from '../../../types/volunteer';

export default function useVolunteerForm() {
  // -----------------------
  // 상태 정의
  // -----------------------
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('봉사활동 모집');

  const [volunteerDate, setVolunteerDate] = useState('');
  const [volunteerStartTime, setVolunteerStartTime] = useState('');
  const [volunteerEndTime, setVolunteerEndTime] = useState('');

  const [recruitmentStartDate, setRecruitmentStartDate] = useState('');
  const [recruitmentEndDate, setRecruitmentEndDate] = useState('');

  const [province, setProvince] = useState('');
  const [city, setCity] = useState<string | null>('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [totalCapacity, setTotalCapacity] = useState<number | ''>('');
  const [teamCount, setTeamCount] = useState<number | ''>('');

  const [attendanceStartTime, setAttendanceStartTime] = useState('');
  const [attendanceEndTime, setAttendanceEndTime] = useState('');
  const [attendanceRadius, setAttendanceRadius] = useState<number | ''>(100);

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // -----------------------
  // 팀당 인원 계산
  // -----------------------
  const perTeam = useMemo(() => {
    if (
      typeof totalCapacity === 'number' &&
      typeof teamCount === 'number' &&
      teamCount > 0
    ) {
      return Math.floor(totalCapacity / teamCount);
    }
    return 0;
  }, [totalCapacity, teamCount]);

  // -----------------------
  // 헬퍼: 시간 문자열 -> 분 단위
  // -----------------------
  const parseTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  // -----------------------
  // 1. 필드 검증 (빈칸 체크)
  // -----------------------
  const getFieldErrors = () => {
    const errors: Record<string, string> = {};

    if (!title) errors.title = '제목을 입력해주세요.';
    if (!content) errors.content = '내용을 입력해주세요.';

    if (!volunteerDate) errors.volunteerDate = '봉사 일자를 입력해주세요.';
    if (!volunteerStartTime) errors.volunteerStartTime = '시작 시간을 입력해주세요.';
    if (!volunteerEndTime) errors.volunteerEndTime = '종료 시간을 입력해주세요.';

    if (!recruitmentStartDate) errors.recruitmentStartDate = '모집 시작일을 선택해주세요.';
    if (!recruitmentEndDate) errors.recruitmentEndDate = '모집 종료일을 선택해주세요.';

    if (!totalCapacity) errors.totalCapacity = '총 인원을 입력해주세요.';
    if (!teamCount) errors.teamCount = '팀 개수를 입력해주세요.';

    if (!attendanceStartTime) errors.attendanceStartTime = '출석 시작 시간을 입력해주세요.';
    if (!attendanceEndTime) errors.attendanceEndTime = '출석 종료 시간을 입력해주세요.';
    if (!province) errors.province = '지역을 선택해주세요.';
    if (!locationName) errors.locationName = '상세 장소명을 입력해주세요.';
    if (!latitude) errors.latitude = '위도를 입력해주세요.';
    if (!longitude) errors.longitude = '경도를 입력해주세요.';

    return errors;
  };

  const isSubmitDisabled = Object.keys(getFieldErrors()).length > 0;

  // -----------------------
  // 2. 논리/계산 체크 (알림용)
  // -----------------------
  const getAlerts = () => {
    const alerts: Record<string, string> = {};

    // 봉사 일자: 오늘 이후
    if (volunteerDate) {
      const volunteer = new Date(volunteerDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 시간 제거
      if (volunteer < today)
        alerts.volunteerDate = '봉사 일자는 오늘 이후여야 합니다.';
    }

    // 봉사 시간 체크
    if (volunteerStartTime && volunteerEndTime) {
      if (parseTime(volunteerStartTime) >= parseTime(volunteerEndTime)) {
        alerts.volunteerEndTime = '종료 시간은 시작 시간보다 이후여야 합니다.';
      }
    }

    // 출석 시간 체크
    if (attendanceStartTime && attendanceEndTime) {
      if (parseTime(attendanceStartTime) >= parseTime(attendanceEndTime)) {
        alerts.attendanceEndTime = '출석 종료 시간은 시작 시간보다 이후여야 합니다.';
      }
    }

    // 출석 반경
    if (typeof attendanceRadius === 'number' && attendanceRadius < 100) {
      alerts.attendanceRadius = '출석 반경은 최소 100m 이상이어야 합니다.';
    }

    // 모집 기간 체크 (문자열 비교)
    if (recruitmentStartDate && recruitmentEndDate) {
      if (recruitmentStartDate > recruitmentEndDate) {
        alerts.recruitmentEndDate =
          '모집 종료일은 시작일보다 이후여야 합니다.';
      }
    }

    if (volunteerDate) {
      if (recruitmentStartDate && recruitmentStartDate > volunteerDate) {
        alerts.recruitmentStartDate =
          '모집 시작일은 봉사 일자보다 이전이어야 합니다.';
      }
      if (recruitmentEndDate && recruitmentEndDate > volunteerDate) {
        alerts.recruitmentEndDate =
          '모집 종료일은 봉사 일자보다 이전이어야 합니다.';
      }
    }

    return alerts;
  };

  const alerts = getAlerts();
  const isAlerted = Object.keys(alerts).length > 0;

  // -----------------------
  // 반환
  // -----------------------
  return {
    // 기본 정보
    title,
    setTitle,
    content,
    setContent,
    category,
    setCategory,

    // 봉사 일자 & 시간
    volunteerDate,
    setVolunteerDate,
    volunteerStartTime,
    setVolunteerStartTime,
    volunteerEndTime,
    setVolunteerEndTime,

    // 모집 기간
    recruitmentStartDate,
    setRecruitmentStartDate,
    recruitmentEndDate,
    setRecruitmentEndDate,

    // 위치 정보
    province,
    setProvince,
    city,
    setCity,
    locationName,
    setLocationName,
    latitude,
    setLatitude,
    longitude,
    setLongitude,

    // 팀 & 인원
    totalCapacity,
    setTotalCapacity,
    teamCount,
    setTeamCount,
    perTeam,

    // 출석 정책
    attendanceStartTime,
    setAttendanceStartTime,
    attendanceEndTime,
    setAttendanceEndTime,
    attendanceRadius,
    setAttendanceRadius,

    // UI 상태
    locationModalOpen,
    setLocationModalOpen,
    submitting,
    setSubmitting,

    // 상태 체크
    getFieldErrors,
    getAlerts,
    alerts,
    isSubmitDisabled,
    isAlerted,
  };
}
