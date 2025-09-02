import React from 'react';
import {
  TextField, Typography, Button, Select, MenuItem,
  InputLabel, FormControl, Stack, Box, InputAdornment, CircularProgress,
  Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Checkbox, FormControlLabel,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import AppDialog from './AppDialog';
import type { DetailPost, PostStatus, TeamStatus } from '../types/volunteer';
import { fetchPostTeams } from '../api/volunteerPosts';

type Props = {
  open: boolean;
  onClose: () => void;
  data: DetailPost;
  onSave?: (next: DetailPost) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
};

export default function VolunteerDetailModal({ open, onClose, data, onSave, onDelete }: Props) {
  const [edited, setEdited] = React.useState<DetailPost>(data);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  // 삭제 확인 다이얼로그
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmAgree, setConfirmAgree] = React.useState(false);

  // 팀 상태
  const [teams, setTeams] = React.useState<TeamStatus[]>([]);
  const [teamsLoading, setTeamsLoading] = React.useState(false);

  const postId = data.id;

  React.useEffect(() => {
    if (open) setEdited(data);
  }, [open, data]);

  // 모달 오픈 시 팀 정보 로드
  React.useEffect(() => {
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
    return () => {
      ignore = true;
    };
  }, [open, postId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target as { name?: string; value: any };
    if (!name) return;
    setEdited((prev) => ({ ...prev, [name]: value }));
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

  const openDeleteConfirm = () => {
    setConfirmAgree(false);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!onDelete || edited.id == null) return;
    try {
      setDeleting(true);
      await onDelete(edited.id); // 부모에서 모달 닫고 목록 리프레시
      setConfirmOpen(false);
    } catch (e) {
      console.error(e);
      alert('삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  // 팀 개수 / 팀당 정원 표시값
  const teamCount = teams.length;
  const perTeamCapacity =
    teamCount === 0
      ? 0
      : (() => {
          const set = new Set(teams.map((t) => t.maxCapacity));
          return set.size === 1 ? teams[0].maxCapacity : undefined; // undefined → "팀별 상이"
        })();

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="봉사활동 상세 정보"
      maxWidth="md"
      actions={
        // 좌: 삭제(위험), 우: 닫기/저장(안전)
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button
            onClick={openDeleteConfirm}
            variant="outlined"
            disabled={deleting || saving || edited.id == null}
          >
            삭제
          </Button>

          <Box>
            <Button onClick={onClose} color="inherit" disabled={saving || deleting} sx={{ mr: 1 }}>
              닫기
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={saving || deleting}
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {saving ? '저장 중…' : '저장'}
            </Button>
          </Box>
        </Box>
      }
    >
      <Stack spacing={2.5}>
        {/* 기본 정보 */}
        <TextField fullWidth label="제목" name="title" value={edited.title} onChange={handleChange} />

        <TextField
          fullWidth
          multiline
          minRows={3}
          label="세부사항"
          name="content"
          value={edited.content ?? ''}
          onChange={handleChange}
          placeholder="봉사 내용, 준비물, 유의사항 등을 입력하세요."
        />

        <TextField
          fullWidth
          type="date"
          label="봉사 일자"
          name="volunteerDate"
          value={edited.volunteerDate ?? ''}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />

        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <TextField
              fullWidth
              type="time"
              label="시작 시간"
              name="volunteerStartTime"
              value={(edited as any).volunteerStartTime ?? ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box flex={1}>
            <TextField
              fullWidth
              type="time"
              label="종료 시간"
              name="volunteerEndTime"
              value={(edited as any).volunteerEndTime ?? ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <TextField
              fullWidth
              type="date"
              label="모집 시작"
              name="recruitmentStartDate"
              value={edited.recruitmentStartDate ?? ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box flex={1}>
            <TextField
              fullWidth
              type="date"
              label="모집 마감"
              name="recruitmentEndDate"
              value={edited.recruitmentEndDate ?? ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Stack>

        <FormControl fullWidth>
          <InputLabel id="status-label">상태</InputLabel>
          <Select<PostStatus>
            labelId="status-label"
            label="상태"
            name="status"
            value={edited.status}
            onChange={handleChange}
          >
            <MenuItem value="모집 중">모집 중</MenuItem>
            <MenuItem value="모집 마감">모집 마감</MenuItem>
            <MenuItem value="봉사 완료">봉사 완료</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="지역 (예: 서울특별시 관악구)"
          name="location"
          value={edited.location ?? ''}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          label="상세 장소명"
          name="placeName"
          value={edited.placeName ?? ''}
          onChange={handleChange}
        />

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          좌표: 위도 {edited.latitude ?? '-'}, 경도 {edited.longitude ?? '-'}
        </Typography>

        {/* 출석 정책 */}
        <Typography variant="h6" sx={{ mt: 1 }}>
          출석 정책
        </Typography>
        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <TextField
              fullWidth
              type="time"
              label="출석 시작 시간"
              name="attendanceStartTime"
              value={edited.attendanceStartTime ?? ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box flex={1}>
            <TextField
              fullWidth
              type="time"
              label="출석 종료 시간"
              name="attendanceEndTime"
              value={edited.attendanceEndTime ?? ''}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Stack>

        <Box>
          <TextField
            fullWidth
            type="number"
            inputProps={{ min: 0 }}
            label="출석 인정 반경"
            name="attendanceRadius"
            value={edited.attendanceRadius ?? 0}
            onChange={handleChange}
            InputProps={{ endAdornment: <InputAdornment position="end">m</InputAdornment> }}
          />
        </Box>

        {/* 팀 운영 (조회 전용) */}
        <Typography variant="h6" sx={{ mt: 1 }}>
          팀 운영
        </Typography>
        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <TextField fullWidth label="팀 개수" value={teamCount} disabled />
          </Box>
          <Box flex={1}>
            <TextField
              fullWidth
              label="팀당 정원"
              value={perTeamCapacity != null ? perTeamCapacity : '팀별 상이'}
              disabled
              InputProps={
                perTeamCapacity != null
                  ? { endAdornment: <InputAdornment position="end">명</InputAdornment> }
                  : undefined
              }
            />
          </Box>
        </Stack>

        <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
          팀별 인원 현황
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ height: 44 }}>
                <TableCell sx={{ fontWeight: 'bold' }}>팀 이름</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  인원 (신청/정원)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teamsLoading && (
                <TableRow>
                  <TableCell colSpan={2}>팀 정보 로딩 중…</TableCell>
                </TableRow>
              )}
              {!teamsLoading && teams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2}>팀 정보가 없습니다.</TableCell>
                </TableRow>
              )}
              {!teamsLoading &&
                teams.map((t) => (
                  <TableRow key={t.teamId} sx={{ height: 44 }}>
                    <TableCell>{`팀 ${t.teamNumber}`}</TableCell>
                    <TableCell align="right">
                      {t.currentCount} / {t.maxCapacity}명
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>게시글 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            이 작업은 되돌릴 수 없습니다. 정말로 이 게시글을 삭제하시겠어요?
          </DialogContentText>
          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Checkbox
                checked={confirmAgree}
                onChange={(e) => setConfirmAgree(e.target.checked)}
              />
            }
            label="네, 삭제합니다"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            취소
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            disabled={!confirmAgree || deleting}
          >
            {deleting ? '삭제 중…' : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppDialog>
  );
}
