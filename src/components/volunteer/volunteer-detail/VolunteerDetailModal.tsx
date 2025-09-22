import { useState } from 'react';
import {
  Stack,
  Button,
  CircularProgress,
  GlobalStyles,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import AppDialog from '../../AppDialog';
import useVolunteerDetail from './hooks/useVolunteerDetail';
import TitleSection from './sections/TitleSection';
import ContentSection from './sections/ContentSection';
import StatusSection from './sections/StatusSection';
import VolunteerDateSection from './sections/VolunteerDateSection';
import RecruitmentDateSection from './sections/RecruitmentDateSection';
import LocationSection from './sections/LocationSection';
import CapacitySection from './sections/CapacitySection';
import AttendanceSection from './sections/AttendanceSection';
import TeamListSection from './sections/TeamListSection';
import type { DetailPost } from '../../../types/volunteer';

type Props = {
  open: boolean;
  onClose: () => void;
  data: DetailPost;
  onSave?: (next: DetailPost) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
};

export default function VolunteerDetailModal({ open, onClose, data, onSave, onDelete }: Props) {
  const {
    edited,
    setEdited,
    saving,
    handleChange,
    getFieldErrors,
    alerts,
    isAlerted,
    isSubmitDisabled,
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
  } = useVolunteerDetail(data, open);

  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isCompleted = data.status === '봉사 완료';

  const handleSave = async () => {
    const fieldErrors = getFieldErrors();
    if (Object.keys(fieldErrors).length > 0 || isAlerted) {
      alert('⚠️ 필수 항목 또는 입력 값 오류를 확인해주세요.');
      return;
    }

    if (!onSave) {
      onClose();
      return;
    }

    try {
      await onSave(edited);
      onClose();
    } catch (error: any) {
      console.error('Save error:', error);
      alert('수정에 실패했습니다.');
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!data?.id) {
      alert('삭제할 게시글 ID가 없습니다.');
      setConfirmOpen(false);
      return;
    }

    if (!onDelete) {
      alert('삭제 기능이 제공되지 않습니다.');
      setConfirmOpen(false);
      return;
    }

    try {
      setDeleting(true);
      await onDelete(data.id);
      setConfirmOpen(false);
      onClose();
    } catch (e) {
      console.error('Delete failed', e);
      alert('삭제에 실패했습니다.');
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AppDialog
        open={open}
        onClose={onClose}
        title="봉사활동 상세 정보"
        maxWidth="md"
        actions={
          <>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setConfirmOpen(true)}
              disabled={saving || deleting}
              sx={{ mr: 'auto' }}
              startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              삭제
            </Button>

            <Button onClick={onClose} color="inherit" disabled={saving || deleting}>
              닫기
            </Button>

            <Button
              onClick={handleSave}
              variant="contained"
              disabled={saving || deleting || isSubmitDisabled || isCompleted}
              sx={{ bgcolor: '#ff7c33', ':hover': { bgcolor: '#ff6a14' } }}
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {saving ? '저장 중…' : '저장'}
            </Button>
          </>
        }
      >
        <GlobalStyles
          styles={(theme) => ({
            'input[type="date"], input[type="time"]': {
              colorScheme: (theme as any).palette?.mode,
            },
            'input[type="date"]::-webkit-calendar-picker-indicator, input[type="time"]::-webkit-calendar-picker-indicator': {
              filter: (theme as any).palette?.mode === 'dark' ? 'invert(1)' : 'none',
              opacity: 1,
            },
            'input[type="date"]::-webkit-calendar-picker-indicator:hover, input[type="time"]::-webkit-calendar-picker-indicator:hover': {
              cursor: 'pointer',
            },
          })}
        />

        <Stack spacing={2.5}>
          <TitleSection
            title={edited.title}
            onChange={isCompleted ? undefined : handleChange}
          />

          <ContentSection
            content={edited.content}
            onChange={isCompleted ? undefined : handleChange}
          />

          <StatusSection
            status={edited.status}
            onChange={isCompleted ? undefined : handleChange}
          />

          <VolunteerDateSection
            volunteerDate={edited.volunteerDate}
            startTime={(edited as any).volunteerStartTime}
            endTime={(edited as any).volunteerEndTime}
            onChange={isCompleted ? undefined : handleChange}
            errors={{
              startTime: alerts.volunteerStartTime,
              endTime: alerts.volunteerEndTime,
            }}
          />

          <RecruitmentDateSection
            startDate={edited.recruitmentStartDate}
            endDate={edited.recruitmentEndDate}
            onChange={isCompleted ? undefined : handleChange}
            errors={{
              startDate: alerts.recruitmentStartDate,
              endDate: alerts.recruitmentEndDate,
            }}
          />

          <LocationSection
            edited={edited}
            setEdited={setEdited}
            isCompleted={isCompleted}
          />

          <CapacitySection
            teamCount={teams.length}
            perTeamCapacity={teams.length ? teams[0].maxCapacity : undefined}
          />

          <AttendanceSection
            attendanceStartTime={(edited as any).attendanceStartTime}
            attendanceEndTime={(edited as any).attendanceEndTime}
            attendanceRadius={(edited as any).attendanceRadius}
            onChange={isCompleted ? undefined : handleChange}
            errors={{
              startTime: alerts.attendanceStartTime,
              endTime: alerts.attendanceEndTime,
              radius: alerts.attendanceRadius,
            }}
          />

          <TeamListSection
            teams={teams}
            teamsLoading={teamsLoading}
            expandedTeams={expandedTeams}
            toggleTeam={toggleTeam}
            teamMembers={teamMembers}
            teamLoading={teamLoading}
            memberExpanded={memberExpanded}
            toggleMember={toggleMember}
            memberSaving={memberSaving}
            setAttendance={setAttendance}
          />
        </Stack>
      </AppDialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>게시글 삭제</DialogTitle>
        <DialogContent>
          <Typography>정말 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit" disabled={deleting}>
            취소
          </Button>
          <Button
            onClick={handleDeleteConfirmed}
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{ ml: 1 }}
          >
            {deleting ? '삭제 중…' : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
