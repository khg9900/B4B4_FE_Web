import { useState, useEffect, useMemo } from 'react';
import type { DetailPost, TeamStatus } from '../../../types/volunteer';
import { fetchPostTeams, fetchTeamParticipants, updateParticipantAttendance } from '../../../api/volunteerPosts';

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
  // 시간 검증 유틸 (단순화)
  // ---------------------------
  const validateTime = (_field: keyof DetailPost, _value: string): boolean => {
    if (edited.status === '봉사 완료') {
      alert('⚠️ 봉사 완료 상태인 글은 수정할 수 없습니다.');
      return false;
    }
    return true;
  };

  // ---------------------------
  // 입력 변경 핸들러
  // ---------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    if (!name) return;

    if (!validateTime(name as keyof DetailPost, value)) return;

    setEdited(prev => ({ ...prev, [name]: value }));
  };

  // ---------------------------
  // 팀 / 참가자 관리
  // ---------------------------
  const toggleTeam = async (teamId: number) => {
    const next = !expandedTeams[teamId];
    setExpandedTeams(prev => ({ ...prev, [teamId]: next }));
    if (!next || postId == null) return;

    if (!teamMembers[teamId]) {
      try {
        setTeamLoading(prev => ({ ...prev, [teamId]: true }));
        const res = await fetchTeamParticipants(postId, teamId);
        setTeamMembers(prev => ({ ...prev, [teamId]: res.participants || [] }));
      } catch (e) {
        console.error('팀원 조회 실패', e);
        setTeamMembers(prev => ({ ...prev, [teamId]: [] }));
      } finally {
        setTeamLoading(prev => ({ ...prev, [teamId]: false }));
      }
    }
  };

  const setAttendance = async (teamId: number, p: Participant, nextStatus: 'PRESENT' | 'ABSENT') => {
    if (p.status === 'BLACKLISTED') {
      alert('블랙리스트는 상태 변경이 불가합니다.');
      return;
    }
    try {
      setMemberSaving(prev => ({ ...prev, [p.participantId]: true }));
      await updateParticipantAttendance(postId!, teamId, p.participantId, { status: nextStatus });
      setTeamMembers(prev => {
        const list = prev[teamId] || [];
        const updated = list.map(m => m.participantId === p.participantId ? { ...m, status: nextStatus } : m);
        return { ...prev, [teamId]: updated };
      });
    } catch (e) {
      console.error('출석 상태 변경 실패', e);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setMemberSaving(prev => ({ ...prev, [p.participantId]: false }));
    }
  };

  const toggleMember = (participantId: number) => {
    setMemberExpanded(prev => ({ ...prev, [participantId]: !prev[participantId] }));
  };

  return {
    edited,
    setEdited,
    saving,
    setSaving,
    handleChange,
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
    validateTime,
  };
}
