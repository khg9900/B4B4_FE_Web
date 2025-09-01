// src/components/VolunteerDetailModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  TextField, Typography, Button, Select, MenuItem,
  InputLabel, FormControl, Stack, Box, InputAdornment, CircularProgress,
  Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import AppDialog from './AppDialog';
import type { DetailPost, PostStatus, TeamStatus } from '../types/volunteer';
import { fetchPostTeams } from '../api/volunteerPosts';
import { loadKakaoMap } from '../utils/kakaoLoader';

type Props = {
  open: boolean;
  onClose: () => void;
  data: DetailPost;
  onSave?: (next: DetailPost) => Promise<void>;
};

export default function VolunteerDetailModal({ open, onClose, data, onSave }: Props) {
  const [edited, setEdited] = useState<DetailPost>(data);
  const [saving, setSaving] = useState(false);

  // 팀 상태
  const [teams, setTeams] = useState<TeamStatus[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const postId = data.id;

  // Kakao Map
  const mapContainer = useRef<HTMLDivElement>(null);

  // 데이터 초기화
  useEffect(() => {
    if (open) setEdited(data);
  }, [open, data]);

  // 팀 정보 로드
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
        console.error('팀 조회 실패', e);
        if (!ignore) setTeams([]);
      } finally {
        if (!ignore) setTeamsLoading(false);
      }
    };
    void loadTeams();
    return () => { ignore = true; };
  }, [open, postId]);

  // 지도 로드
  useEffect(() => {
    if (!open || !mapContainer.current) return;
    if (!edited.latitude || !edited.longitude) return;

    (async () => {
      try {
        const kakao = await loadKakaoMap();
        const map = new kakao.maps.Map(mapContainer.current!, {
          center: new kakao.maps.LatLng(edited.latitude, edited.longitude),
          level: 3,
        });
        new kakao.maps.Marker({
          map,
          position: new kakao.maps.LatLng(edited.latitude, edited.longitude),
        });
      } catch (e) {
        console.error('지도 로드 실패', e);
      }
    })();
  }, [open, edited.latitude, edited.longitude]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target as { name?: string; value: any };
    if (!name) return;
    setEdited(prev => ({ ...prev, [name]: value }));
  };

  const requiredFilled =
    edited.title &&
    edited.content &&
    edited.volunteerDate &&
    (edited as any).volunteerStartTime &&
    (edited as any).volunteerEndTime &&
    edited.recruitmentStartDate &&
    edited.recruitmentEndDate &&
    edited.status;

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
      console.error(e);
      alert('수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 팀 개수 / 팀당 정원 계산
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
        {/* 기본 정보 */}
        <TextField fullWidth label="제목" name="title" value={edited.title} onChange={handleChange} />
        <TextField
          fullWidth multiline minRows={3}
          label="세부사항" name="content" value={edited.content ?? ''} onChange={handleChange}
          placeholder="봉사 내용, 준비물, 유의사항 등을 입력하세요."
        />
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
          <Box flex={1}>
            <TextField fullWidth type="date" label="모집 시작" name="recruitmentStartDate"
              value={edited.recruitmentStartDate ?? ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Box>
          <Box flex={1}>
            <TextField fullWidth type="date" label="모집 마감" name="recruitmentEndDate"
              value={edited.recruitmentEndDate ?? ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Box>
        </Stack>

        <FormControl fullWidth>
          <InputLabel id="status-label">상태</InputLabel>
          <Select<PostStatus> labelId="status-label" label="상태" name="status"
            value={edited.status} onChange={handleChange}>
            <MenuItem value="모집 중">모집 중</MenuItem>
            <MenuItem value="모집 마감">모집 마감</MenuItem>
            <MenuItem value="봉사 완료">봉사 완료</MenuItem>
          </Select>
        </FormControl>

        <TextField fullWidth label="지역 (예: 서울특별시 관악구)" name="location"
          value={edited.location ?? ''} onChange={handleChange} />

        <TextField fullWidth label="상세 장소명" name="placeName"
          value={edited.placeName ?? ''} onChange={handleChange} />

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          좌표: 위도 {edited.latitude ?? '-'}, 경도 {edited.longitude ?? '-'}
        </Typography>

        {/* Kakao 지도 */}
        <Box ref={mapContainer} sx={{ width: '100%', height: 400, border: '1px solid #ddd', borderRadius: 1 }} />

        {/* 출석 정책 */}
        <Typography variant="h6" sx={{ mt: 1 }}>출석 정책</Typography>
        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <TextField fullWidth type="time" label="출석 시작 시간" name="attendanceStartTime"
              value={edited.attendanceStartTime ?? ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Box>
          <Box flex={1}>
            <TextField fullWidth type="time" label="출석 종료 시간" name="attendanceEndTime"
              value={edited.attendanceEndTime ?? ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Box>
        </Stack>

        <Box>
          <TextField fullWidth type="number" inputProps={{ min: 0 }} label="출석 인정 반경" name="attendanceRadius"
            value={edited.attendanceRadius ?? 0} onChange={handleChange}
            InputProps={{ endAdornment: <InputAdornment position="end">m</InputAdornment> }} />
        </Box>

        {/* 팀 운영 */}
        <Typography variant="h6" sx={{ mt: 1 }}>팀 운영</Typography>
        <Stack direction="row" spacing={2}>
          <Box flex={1}><TextField fullWidth label="팀 개수" value={teamCount} disabled /></Box>
          <Box flex={1}><TextField fullWidth label="팀당 정원"
            value={perTeamCapacity != null ? perTeamCapacity : '팀별 상이'}
            disabled
            InputProps={perTeamCapacity != null ? { endAdornment: <InputAdornment position="end">명</InputAdornment> } : undefined}
          /></Box>
        </Stack>

        <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>팀별 인원 현황</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ height: 44 }}>
                <TableCell sx={{ fontWeight: 'bold' }}>팀 이름</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>인원 (신청/정원)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamsLoading && <TableRow><TableCell colSpan={2}>팀 정보 로딩 중…</TableCell></TableRow>}
              {!teamsLoading && teams.length === 0 && <TableRow><TableCell colSpan={2}>팀 정보가 없습니다.</TableCell></TableRow>}
              {!teamsLoading && teams.map(t => (
                <TableRow key={t.teamId} sx={{ height: 44 }}>
                  <TableCell>{`팀 ${t.teamNumber}`}</TableCell>
                  <TableCell align="right">{t.currentCount} / {t.maxCapacity}명</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </AppDialog>
  );
}
