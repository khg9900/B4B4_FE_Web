import { useState, useEffect, useMemo } from 'react';
import type { DetailPost, TeamStatus } from '../../../../types/volunteer';
import { fetchPostTeams, fetchTeamParticipants, updateParticipantAttendance } from '../../../../api/volunteerPosts';

export type Participant = {
  participantId: number;
  name: string;
  email: string;
  phone: string;
  status: 'PRESENT' | 'ABSENT' | 'BLACKLISTED' | 'CANCELLED' | 'PARTICIPATED';
};

// 지역 파싱
export function parseRegion(region1: string, region2: string): { province: string; city: string | null } {
  let province = region1;
  let city: string | null = region2;
  if (region1.includes('세종')) city = '';
  else if (region2.endsWith('군')) city = region2;
  return { province, city };
}

export default function useVolunteerDetail(data: DetailPost, open: boolean) {
  const [edited, setEdited] = useState<DetailPost>(data);
  const [saving, setSaving] = useState(false);

  const [teams, setTeams] = useState<TeamStatus[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<Record<number, boolean>>({});
  const [teamMembers, setTeamMembers] = useState<Record<number, Participant[]>>({});
  const [teamLoading, setTeamLoading] = useState<Record<number, boolean>>({});
  const [memberExpanded, setMemberExpanded] = useState<Record<number, boolean>>({});
  const [memberSaving, setMemberSaving] = useState<Record<number, boolean>>({});

  const postId: number | null = useMemo(() => {
    const v = (data as any)?.id;
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
    return null;
  }, [data]);

  // DB 기준 봉사 완료 여부
  const isCompleted = data.status === '봉사 완료';

  useEffect(() => {
    if (open) setEdited(data);
  }, [open, data]);

  // 팀 로딩
  useEffect(() => {
    let ignore = false;
    const loadTeams = async () => {
      if (!open || postId == null) { setTeams([]); return; }
      try {
        setTeamsLoading(true);
        const t = await fetchPostTeams(postId);
        if (!ignore) setTeams(t);
      } catch (e) {
        console.error('팀 조회 실패', e);
        if (!ignore) setTeams([]); 
      } finally {
        if (!ignore) setTeamsLoading(false);
      }
    };
    void loadTeams();
    return () => { ignore = true; };
  }, [open, postId]);

  // ---------------------------
  // 글 단위 수정 처리
  // ---------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    if (!name) return;

    // DB 기준 이미 완료면 수정 자체 불가
    if (isCompleted) return;

    // DB는 완료 아님 + 프론트에서 status=완료 선택 → 알림만
    if (name === 'status' && value === '봉사 완료' && edited.status !== '봉사 완료') {
      alert('⚠️ 봉사 완료 버튼을 누르면 더 이상 수정할 수 없습니다.');
    }

    setEdited(prev => ({ ...prev, [name]: value }));
  };

  // -----------------------
  // 필드 검증 (빈칸 체크)
  // -----------------------
  const getFieldErrors = (): Record<string, string> => {
    const errors: Record<string,string> = {};
    if (!edited.title) errors.title = '제목을 입력해주세요.';
    if (!edited.content) errors.content = '내용을 입력해주세요.';
    if (!edited.volunteerDate) errors.volunteerDate = '봉사 일자를 입력해주세요.';
    if (!edited.volunteerStartTime) errors.volunteerStartTime = '시작 시간을 입력해주세요.';
    if (!edited.volunteerEndTime) errors.volunteerEndTime = '종료 시간을 입력해주세요.';
    if (!edited.recruitmentStartDate) errors.recruitmentStartDate = '모집 시작일을 선택해주세요.';
    if (!edited.recruitmentEndDate) errors.recruitmentEndDate = '모집 종료일을 선택해주세요.';
    if (!edited.totalCapacity) errors.totalCapacity = '총 인원을 입력해주세요.';
    if (!edited.attendanceStartTime) errors.attendanceStartTime = '출석 시작 시간을 입력해주세요.';
    if (!edited.attendanceEndTime) errors.attendanceEndTime = '출석 종료 시간을 입력해주세요.';
    if (!edited.province) errors.province = '지역을 선택해주세요.';
    if (!edited.placeName) errors.placeName = '상세 장소명을 입력해주세요.';
    if (!edited.latitude) errors.latitude = '위도를 입력해주세요.';
    if (!edited.longitude) errors.longitude = '경도를 입력해주세요.';
    return errors;
  };

  // -----------------------
  // 논리/계산 체크 알림 (빨간줄)
  // -----------------------
  const getAlerts = (): Record<string,string> => {
    const alerts: Record<string,string> = {};
    const parseTime = (time:string) => { const [h,m]=time.split(':').map(Number); return h*60+m; };

    if (edited.volunteerDate) {
      const volunteer = new Date(edited.volunteerDate);
      const today = new Date(); today.setHours(0,0,0,0);
      if (volunteer < today) alerts.volunteerDate = '봉사 일자는 오늘 이후여야 합니다.';
    }

    if (edited.volunteerStartTime && edited.volunteerEndTime) {
      if (parseTime(edited.volunteerStartTime) >= parseTime(edited.volunteerEndTime)) {
        alerts.volunteerEndTime = '종료 시간은 시작 시간보다 이후여야 합니다.';
      }
    }

    if (edited.attendanceStartTime && edited.attendanceEndTime) {
      if (parseTime(edited.attendanceStartTime) >= parseTime(edited.attendanceEndTime)) {
        alerts.attendanceEndTime = '출석 종료 시간은 시작 시간보다 이후여야 합니다.';
      }
    }

    if (typeof edited.attendanceRadius === 'number' && edited.attendanceRadius < 100) {
      alerts.attendanceRadius = '출석 반경은 최소 100m 이상이어야 합니다.';
    }

    if (edited.recruitmentStartDate && edited.recruitmentEndDate && edited.recruitmentStartDate > edited.recruitmentEndDate) {
      alerts.recruitmentEndDate = '모집 종료일은 시작일보다 이후여야 합니다.';
    }

    if (edited.volunteerDate) {
      if (edited.recruitmentStartDate && edited.recruitmentStartDate > edited.volunteerDate) {
        alerts.recruitmentStartDate = '모집 시작일은 봉사 일자보다 이전이어야 합니다.';
      }
      if (edited.recruitmentEndDate && edited.recruitmentEndDate > edited.volunteerDate) {
        alerts.recruitmentEndDate = '모집 종료일은 봉사 일자보다 이전이어야 합니다.';
      }
    }

    return alerts;
  };

  const alerts = getAlerts();

  // -----------------------
  // isSubmitDisabled 계산
  // -----------------------
  const fieldErrors = getFieldErrors();
  const isAlerted = Object.keys(alerts).length > 0;
  const isSubmitDisabled = Object.keys(fieldErrors).length > 0 || isAlerted || isCompleted; // DB 기준만 사용

  // ---------------------------
  // 팀/참가자 관리
  // ---------------------------
  const toggleTeam = async (teamId:number) => {
    const next = !expandedTeams[teamId];
    setExpandedTeams(prev=>({...prev,[teamId]:next}));
    if(!next || postId==null) return;
    if(!teamMembers[teamId]){
      try {
        setTeamLoading(prev=>({...prev,[teamId]:true}));
        const res = await fetchTeamParticipants(postId,teamId);
        setTeamMembers(prev=>({...prev,[teamId]:res.participants||[]})); 
      }catch(e){
        console.error('팀원 조회 실패', e);
        setTeamMembers(prev=>({...prev,[teamId]:[]})); 
      }finally{
        setTeamLoading(prev=>({...prev,[teamId]:false})); 
      }
    }
  };

  const setAttendance = async (teamId:number,p:Participant,nextStatus:'PRESENT'|'ABSENT')=>{
    if (p.status==='BLACKLISTED') return; 
    try{
      setMemberSaving(prev=>({...prev,[p.participantId]:true}));
      await updateParticipantAttendance(postId!,teamId,p.participantId,{status:nextStatus});
      setTeamMembers(prev=>{
        const list = prev[teamId]||[];
        const updated = list.map(m=>m.participantId===p.participantId?{...m,status:nextStatus}:m);
        return {...prev,[teamId]:updated};
      });
    }catch(e){
      console.error('출석 상태 변경 실패', e);
    }finally{
      setMemberSaving(prev=>({...prev,[p.participantId]:false}));
    }
  };

  const toggleMember = (participantId:number)=>{
    setMemberExpanded(prev=>({...prev,[participantId]:!prev[participantId]}));
  };

  return {
    edited,
    setEdited,
    saving,
    setSaving,
    handleChange,
    getFieldErrors,
    getAlerts,
    alerts,
    isAlerted,
    isSubmitDisabled,
    isCompleted,
    teams,
    teamsLoading,
    expandedTeams,
    toggleTeam,
    teamMembers,
    teamLoading,
    memberExpanded,
    toggleMember,
    memberSaving,
    setAttendance,
    postId,
  };
}
