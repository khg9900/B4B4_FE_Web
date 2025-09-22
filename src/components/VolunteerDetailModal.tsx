import React, { useEffect, useState } from 'react';
import {
  TextField, Typography, Button, Select, MenuItem,
  InputLabel, FormControl, Stack, Box, InputAdornment, CircularProgress,
  Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Collapse, IconButton, Divider, Modal
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import AppDialog from './AppDialog';
import LocationPicker from '../components/volunteer/LocationPicker';
import type { DetailPost, PostStatus, TeamStatus } from '../types/volunteer';
import { fetchPostTeams, fetchTeamParticipants, updateParticipantAttendance } from '../api/volunteerPosts';
import { logger } from '../../utils/logger';

type Props = {
  open: boolean;
  onClose: () => void;
  data: DetailPost;
  onSave?: (next: DetailPost) => Promise<void>;
};

type Participant = {
  participantId: number;
  name: string;
  email: string;
  phone: string;
  status: 'PRESENT' | 'ABSENT' | 'BLACKLISTED' | 'CANCELLED' | 'PARTICIPATED';
};

function parseRegion(region1: string, region2: string): { province: string; city: string | null } {
  let province = region1;
  let city: string | null = region2;
  if (region1.includes('세종')) city = '';
  else if (region2.endsWith('군')) city = region2;
  return { province, city };
}

export default function VolunteerDetailModal({ open, onClose, data, onSave }: Props) {
  const [edited, setEdited] = useState<DetailPost>(data);
  const [saving, setSaving] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const [teams, setTeams] = useState<TeamStatus[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const postId: number | null = React.useMemo(() => {
    const v = (data as any)?.id;
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
    return null;
  }, [data]);

  const [expandedTeams, setExpandedTeams] = useState<Record<number, boolean>>({});
  const [teamMembers, setTeamMembers] = useState<Record<number, Participant[]>>({});
  const [teamLoading, setTeamLoading] = useState<Record<number, boolean>>({});
  const [memberExpanded, setMemberExpanded] = useState<Record<number, boolean>>({});
  const [memberSaving, setMemberSaving] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (open) setEdited(data);
  }, [open, data]);

  useEffect(() => {
    let ignore = false;
    const loadTeams = async () => {
      if (!open || postId == null) {
        setTeams([]);
        return;
      }
      try {
        setTeamsLoading(true);
        const t = await fetchPostTeams(postId);
        if (!ignore) setTeams(t);
      } catch (e) {
        logger.capture('VolunteerDetailModal:loadTeams', e, { postId });
        if (!ignore) setTeams([]);
      } finally {
        if (!ignore) setTeamsLoading(false);
      }
    };
    void loadTeams();
    return () => { ignore = true; };
  }, [open, postId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target as { name?: string; value: any };
    if (!name) return;
    setEdited(prev => ({ ...prev, [name]: value }));
  };

  const { province, city } = parseRegion(
    edited.location?.split(' ')[0] ?? '',
    edited.location?.split(' ').slice(1).join(' ') ?? ''
  );

  const requiredFilled =
    edited.title &&
    edited.content &&
    edited.volunteerDate &&
    (edited as any).volunteerStartTime &&
    (edited as any).volunteerEndTime &&
    edited.recruitmentStartDate &&
    edited.recruitmentEndDate &&
    edited.status &&
    province &&
    city !== undefined;

  const handleSave = async () => {
    if (!requiredFilled) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    if (!onSave) {
      onClose();
      return;
    }
    try {
      setSaving(true);
      await onSave(edited);
      onClose();
    } catch (e) {
      logger.capture('VolunteerDetailModal:handleSave', e, { edited });
      alert('수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const toggleTeam = async (teamId: number) => {
    const next = !expandedTeams[teamId];
    setExpandedTeams(prev => ({ ...prev, [teamId]: next }));

    if (!next) return;
    if (postId == null) return;

    if (!teamMembers[teamId]) {
      try {
        setTeamLoading(prev => ({ ...prev, [teamId]: true }));
        const res = await fetchTeamParticipants(postId, teamId);
        setTeamMembers(prev => ({ ...prev, [teamId]: res.participants || [] }));
      } catch (e) {
        logger.capture('VolunteerDetailModal:fetchTeamParticipants', e, { postId, teamId });
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
      logger.capture('VolunteerDetailModal:updateAttendance', e, {
        postId, teamId, participantId: p.participantId, nextStatus
      });
      alert('상태 변경에 실패했습니다.');
    } finally {
      setMemberSaving(prev => ({ ...prev, [p.participantId]: false }));
    }
  };

  const toggleMember = (participantId: number) => {
    setMemberExpanded(prev => ({ ...prev, [participantId]: !prev[participantId] }));
  };

  const teamCount = teams.length;
  const perTeamCapacity =
    teamCount === 0
      ? 0
      : (() => {
          const set = new Set(teams.map(t => t.maxCapacity));
          return set.size === 1 ? teams[0].maxCapacity : undefined;
        })();

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="봉사활동 상세 정보"
      maxWidth="md"
      actions={
        <>
          <Button onClick={onClose} color="inherit" disabled={saving}>닫기</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            sx={{ bgcolor: '#ff7c33', ':hover': { bgcolor: '#ff6a14' } }}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {saving ? '저장 중…' : '저장'}
          </Button>
        </>
      }
    >
      <Stack spacing={2.5}>
        <TextField fullWidth label="제목" name="title" value={edited.title} onChange={handleChange} />
        <TextField fullWidth multiline minRows={3} label="세부사항" name="content" value={edited.content ?? ''} onChange={handleChange} placeholder="봉사 내용, 준비물, 유의사항 등을 입력하세요." />

        <TextField fullWidth type="date" label="봉사 일자" name="volunteerDate"
          value={edited.volunteerDate ?? ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />

        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <TextField fullWidth type="time" label="시작 시간" name="volunteerStartTime"
              value={(edited as any).volunteerStartTime ?? ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Box>
          <Box flex={1}>
            <TextField fullWidth type="time" label="종료 시간" name="volunteerEndTime"
              value={(edited as any).volunteerEndTime ?? ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Box flex={1}><TextField fullWidth type="date" label="모집 시작" name="recruitmentStartDate" value={edited.recruitmentStartDate ?? ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Box>
          <Box flex={1}><TextField fullWidth type="date" label="모집 마감" name="recruitmentEndDate" value={edited.recruitmentEndDate ?? ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Box>
        </Stack>

        <FormControl fullWidth>
          <InputLabel id="status-label">상태</InputLabel>
          <Select<PostStatus> labelId="status-label" label="상태" name="status" value={edited.status} onChange={handleChange}>
            <MenuItem value="모집 중">모집 중</MenuItem>
            <MenuItem value="모집 마감">모집 마감</MenuItem>
            <MenuItem value="봉사 완료">봉사 완료</MenuItem>
          </Select>
        </FormControl>

        <TextField fullWidth label="지역 (예: 서울특별시 관악구)" name="location" value={edited.location ?? ''} onChange={handleChange} />
        <TextField fullWidth label="상세 장소명" name="placeName" value={edited.placeName ?? ''} onChange={handleChange} />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          좌표: 위도 {edited.latitude ?? '-'}, 경도 {edited.longitude ?? '-'}
        </Typography>

        <Button variant="outlined" onClick={() => setLocationModalOpen(true)}>
          위치 변경
        </Button>
        <Modal open={locationModalOpen} onClose={() => setLocationModalOpen(false)}>
          <Box sx={{ width: 600, bgcolor: 'white', p: 2, mx: 'auto', mt: '10%', borderRadius: 2 }}>
            <LocationPicker
              province={province}
              city={city ?? ''}
              placeName={edited.placeName ?? ''}
              latitude={String(edited.latitude ?? '')}
              longitude={String(edited.longitude ?? '')}
              setProvince={(v: any) =>
                setEdited((prev) => {
                  const parts = (prev.location ?? '').split(' ');
                  const cityPart = parts.slice(1).join(' ');
                  return { ...prev, location: `${v} ${cityPart}`.trim() };
                })
              }
              setCity={(v: string | null) =>
                setEdited((prev) => {
                  const parts = (prev.location ?? '').split(' ');
                  const provincePart = parts[0] ?? '';
                  const safeCity = v ?? '';
                  return { ...prev, location: `${provincePart} ${safeCity}`.trim() };
                })
              }
              setPlaceName={(v: any) => setEdited(prev => ({ ...prev, placeName: v }))}
              setLatitude={(v: string) => setEdited(prev => ({ ...prev, latitude: parseFloat(v) }))}
              setLongitude={(v: string) => setEdited(prev => ({ ...prev, longitude: parseFloat(v) }))}
              modalOpen={locationModalOpen}
            />

            <Button onClick={() => setLocationModalOpen(false)} sx={{ mt: 2 }}>닫기</Button>
          </Box>
        </Modal>

        <Typography variant="h6" sx={{ mt: 1 }}>출석 정책</Typography>
        <Stack direction="row" spacing={2}>
          <Box flex={1}><TextField fullWidth type="time" label="출석 시작 시간" name="attendanceStartTime" value={edited.attendanceStartTime ?? ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Box>
          <Box flex={1}><TextField fullWidth type="time" label="출석 종료 시간" name="attendanceEndTime" value={edited.attendanceEndTime ?? ''} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Box>
        </Stack>
        <Box>
          <TextField fullWidth type="number" inputProps={{ min: 0 }} label="출석 인정 반경" name="attendanceRadius" value={edited.attendanceRadius ?? 0} onChange={handleChange} InputProps={{ endAdornment: <InputAdornment position="end">m</InputAdornment> }} />
        </Box>

        <Typography variant="h6" sx={{ mt: 1 }}>팀 운영</Typography>
        <Stack direction="row" spacing={2}>
          <Box flex={1}><TextField fullWidth label="팀 개수" value={teamCount} disabled /></Box>
          <Box flex={1}><TextField fullWidth label="팀당 정원" value={perTeamCapacity != null ? perTeamCapacity : '팀별 상이'} disabled InputProps={perTeamCapacity != null ? { endAdornment: <InputAdornment position="end">명</InputAdornment> } : undefined} /></Box>
        </Stack>

        <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>팀별 인원 현황</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ height: 44 }}>
                <TableCell sx={{ fontWeight: 'bold' }}>팀 이름</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>인원 (신청/정원)</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', width: 96 }}>팀원</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamsLoading && <TableRow><TableCell colSpan={3}>팀 정보 로딩 중…</TableCell></TableRow>}
              {!teamsLoading && teams.length === 0 && <TableRow><TableCell colSpan={3}>팀 정보가 없습니다.</TableCell></TableRow>}
              {!teamsLoading && teams.map(t => {
                const isOpen = !!expandedTeams[t.teamId];
                return (
                  <React.Fragment key={t.teamId}>
                    <TableRow sx={{ height: 44 }}>
                      <TableCell>{`팀 ${t.teamNumber}`}</TableCell>
                      <TableCell align="right">{t.currentCount} / {t.maxCapacity}명</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => toggleTeam(t.teamId)} aria-label="팀원 보기">
                          {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={3} sx={{ p: 0, bgcolor: 'background.default' }}>
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2 }}>
                            {teamLoading[t.teamId] && <Typography variant="body2">팀원 로딩 중…</Typography>}
                            {!teamLoading[t.teamId] && (
                              <>
                                {(!teamMembers[t.teamId] || teamMembers[t.teamId].length === 0) ? (
                                  <Typography variant="body2">팀원이 없습니다.</Typography>
                                ) : (
                                  <Table size="small" aria-label="team-members">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>이름</TableCell>
                                        <TableCell>이메일</TableCell>
                                        <TableCell>전화번호</TableCell>
                                        <TableCell sx={{ width: 100 }}>상태</TableCell>
                                        <TableCell align="center" sx={{ width: 180 }}>참여/비참여</TableCell>
                                        <TableCell align="center" sx={{ width: 80 }}>상세</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {teamMembers[t.teamId]?.map(p => {
                                        const mOpen = !!memberExpanded[p.participantId];
                                        const isSaving = !!memberSaving[p.participantId];
                                        const present = p.status === 'PRESENT';
                                        const absent = p.status === 'ABSENT';
                                        const blacklisted = p.status === 'BLACKLISTED';
                                        return (
                                          <React.Fragment key={p.participantId}>
                                            <TableRow hover>
                                              <TableCell>{p.name}</TableCell>
                                              <TableCell>{p.email}</TableCell>
                                              <TableCell>{p.phone}</TableCell>
                                              <TableCell sx={{ width: 100, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {p.status}
                                              </TableCell>
                                              <TableCell align="center">
                                                <Stack direction="row" spacing={1} justifyContent="center">
                                                  <Button
                                                    size="small"
                                                    variant={present ? 'contained' : 'outlined'}
                                                    disabled={isSaving || present || blacklisted}
                                                    onClick={() => setAttendance(t.teamId, p, 'PRESENT')}
                                                  >
                                                    참여
                                                  </Button>
                                                  <Button
                                                    size="small"
                                                    variant={absent ? 'contained' : 'outlined'}
                                                    disabled={isSaving || absent || blacklisted}
                                                    onClick={() => setAttendance(t.teamId, p, 'ABSENT')}
                                                  >
                                                    비참여
                                                  </Button>
                                                </Stack>
                                              </TableCell>
                                              <TableCell align="center">
                                                <IconButton size="small" onClick={() => toggleMember(p.participantId)} aria-label="상세">
                                                  {mOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                </IconButton>
                                              </TableCell>
                                            </TableRow>

                                            <TableRow>
                                              <TableCell colSpan={6} sx={{ p: 0, bgcolor: 'background.paper' }}>
                                                <Collapse in={mOpen} timeout="auto" unmountOnExit>
                                                  <Box sx={{ p: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>팀원 상세 정보</Typography>
                                                    <Divider sx={{ mb: 1 }} />
                                                    <Stack spacing={0.5}>
                                                      <Typography variant="body2">이름: {p.name}</Typography>
                                                      <Typography variant="body2">이메일: {p.email}</Typography>
                                                      <Typography variant="body2">전화번호: {p.phone}</Typography>
                                                      <Typography variant="body2">상태: {p.status}</Typography>
                                                    </Stack>
                                                  </Box>
                                                </Collapse>
                                              </TableCell>
                                            </TableRow>
                                          </React.Fragment>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                )}
                              </>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </AppDialog>
  );
}
