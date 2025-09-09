import { Stack, Button, CircularProgress, GlobalStyles } from '@mui/material';
import AppDialog from '../AppDialog';
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
import type { DetailPost } from '../../types/volunteer';

type Props = {
  open: boolean;
  onClose: () => void;
  data: DetailPost;
  onSave?: (next: DetailPost) => Promise<void>;
};

export default function VolunteerDetailModal({ open, onClose, data, onSave }: Props) {
  const {
    edited, setEdited, saving, handleChange,
    getFieldErrors, alerts, isAlerted, isSubmitDisabled,
    teams, teamsLoading, expandedTeams, toggleTeam,
    teamMembers, teamLoading, memberExpanded, toggleMember,
    memberSaving, setAttendance,
  } = useVolunteerDetail(data, open);

  const handleSave = async () => {
    const fieldErrors = getFieldErrors();
    if (Object.keys(fieldErrors).length > 0 || isAlerted) {
      alert('⚠️ 필수 항목 또는 입력 값 오류를 확인해주세요.');
      return;
    }

    if (!onSave) return onClose();

    try {
      await onSave(edited);
      onClose();
    } catch (error: any) {
      console.error('Save error:', error);
      alert('수정에 실패했습니다.');
    }
  };

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
            disabled={saving || isSubmitDisabled}
            sx={{ bgcolor: '#ff7c33', ':hover': { bgcolor: '#ff6a14' } }}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {saving ? '저장 중…' : '저장'}
          </Button>
        </>
      }
    >
      {/* input[type=date|time] 스타일 적용 */}
      <GlobalStyles
        styles={(theme) => ({
          'input[type="date"], input[type="time"]': {
            colorScheme: theme.palette.mode,
          },
          'input[type="date"]::-webkit-calendar-picker-indicator, input[type="time"]::-webkit-calendar-picker-indicator': {
            filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
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
          onChange={handleChange}
        />

        <ContentSection
          content={edited.content}
          onChange={handleChange}
        />

        <StatusSection
          status={edited.status}
          onChange={handleChange}
        />

        <VolunteerDateSection
          volunteerDate={edited.volunteerDate}
          startTime={(edited as any).volunteerStartTime}
          endTime={(edited as any).volunteerEndTime}
          onChange={handleChange}
          errors={{
            startTime: alerts.volunteerStartTime,
            endTime: alerts.volunteerEndTime,
          }}
        />

        <RecruitmentDateSection
          startDate={edited.recruitmentStartDate}
          endDate={edited.recruitmentEndDate}
          onChange={handleChange}
          errors={{
            startDate: alerts.recruitmentStartDate,
            endDate: alerts.recruitmentEndDate,
          }}
        />

        <LocationSection
          edited={edited}
          setEdited={setEdited}
        />

        <CapacitySection
          teamCount={teams.length}
          perTeamCapacity={teams.length ? teams[0].maxCapacity : undefined}
        />

        <AttendanceSection
          attendanceStartTime={(edited as any).attendanceStartTime}
          attendanceEndTime={(edited as any).attendanceEndTime}
          attendanceRadius={(edited as any).attendanceRadius}
          onChange={handleChange}
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
  );
}
