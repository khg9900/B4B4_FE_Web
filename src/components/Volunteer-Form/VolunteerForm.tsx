// src/components/Volunteer-Form/VolunteerForm.tsx
import { useMemo } from 'react';
import { Box, Stack, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useVolunteerForm from './hooks/useVolunteerForm';
import TitleCategorySection from './sections/TitleCategorySection';
import ContentSection from './sections/ContentSection';
import VolunteerDateSection from './sections/VolunteerDateSection';
import RecruitmentPeriodSection from './sections/RecruitmentPeriodSection';
import LocationSection from './sections/LocationSection';
import TeamSection from './sections/TeamSection';
import AttendancePolicySection from './sections/AttendancePolicySection';
import LocationModal from './LocationModal';
import type { CreatePostRequest } from '../../types/volunteer';

type Props = {
  createApi: (payload: CreatePostRequest) => Promise<any>;
  onSubmitSuccess?: (created: any) => void;
  onCancel?: () => void;
  submitLabel?: string;
};

export default function VolunteerForm({
  createApi,
  onSubmitSuccess,
  onCancel,
  submitLabel = '등록'
}: Props) {
  const form = useVolunteerForm();
  const theme = useTheme();

  const pickerSx = useMemo(
    () => ({
      '& input': { colorScheme: theme.palette.mode },
      '& input::-webkit-calendar-picker-indicator': {
        filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
        opacity: 1,
      },
    }),
    [theme.palette.mode]
  );
  // 알림용 검증 결과
  const alerts = form.getAlerts();

  const handleSubmit = async () => {
    if (form.isSubmitDisabled) return;

    form.setSubmitting(true);
    try {
      const payload: CreatePostRequest = {
        title: form.title,
        content: form.content,
        volunteerDate: form.volunteerDate,
        volunteerStartTime: form.volunteerStartTime,
        volunteerEndTime: form.volunteerEndTime,
        recruitmentStartDate: form.recruitmentStartDate,
        recruitmentEndDate: form.recruitmentEndDate,
        totalCapacity: form.totalCapacity as number,
        teamSize: form.perTeam,
        category: form.category === '봉사활동 모집' ? 'RECRUITMENT' : 'SUPPORT',
        location: {
          province: form.province,
          city: form.city || '',
          placeName: form.locationName,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude)
        },
        attendancePolicy: {
          checkinStart: `${form.volunteerDate}T${form.attendanceStartTime}`,
          checkinEnd: `${form.volunteerDate}T${form.attendanceEndTime}`,
          allowedRadiusM: typeof form.attendanceRadius === 'number' ? form.attendanceRadius : 100
        }
      };

      const created = await createApi(payload);
      onSubmitSuccess?.(created);
    } catch (e: any) {
      console.error('등록 실패:', e);
    } finally {
      form.setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Stack spacing={2.5}>
        <TitleCategorySection
          title={form.title}
          setTitle={form.setTitle}
          category={form.category}
          setCategory={form.setCategory}
        />

        <ContentSection
          content={form.content}
          setContent={form.setContent}
        />

        <VolunteerDateSection
          volunteerDate={form.volunteerDate}
          setVolunteerDate={form.setVolunteerDate}
          startTime={form.volunteerStartTime}
          setStartTime={form.setVolunteerStartTime}
          endTime={form.volunteerEndTime}
          setEndTime={form.setVolunteerEndTime}
          pickerSx={pickerSx}
          errors={{
            volunteerDate: alerts.volunteerDate,
            startTime: alerts.volunteerStartTime,
            endTime: alerts.volunteerEndTime
          }}
        />

        <RecruitmentPeriodSection
          recruitmentStartDate={form.recruitmentStartDate}
          setRecruitmentStartDate={form.setRecruitmentStartDate}
          recruitmentEndDate={form.recruitmentEndDate}
          setRecruitmentEndDate={form.setRecruitmentEndDate}
          pickerSx={pickerSx}
          errors={{
            recruitmentStartDate: alerts.recruitmentStartDate,
            recruitmentEndDate: alerts.recruitmentEndDate
          }}
        />

        <LocationSection
          onOpenModal={() => form.setLocationModalOpen(true)}
          province={form.province}
          city={form.city}
          locationName={form.locationName}
          latitude={form.latitude}
          longitude={form.longitude}
          setLocationName={form.setLocationName}
        />

        <TeamSection
          totalCapacity={form.totalCapacity}
          setTotalCapacity={form.setTotalCapacity}
          teamCount={form.teamCount}
          setTeamCount={form.setTeamCount}
          perTeam={form.perTeam}
        />

        <AttendancePolicySection
          attendanceStartTime={form.attendanceStartTime}
          setAttendanceStartTime={form.setAttendanceStartTime}
          attendanceEndTime={form.attendanceEndTime}
          setAttendanceEndTime={form.setAttendanceEndTime}
          attendanceRadius={form.attendanceRadius}
          setAttendanceRadius={form.setAttendanceRadius}
          pickerSx={pickerSx}
          errors={{
            startTime: alerts.attendanceStartTime,
            endTime: alerts.attendanceEndTime,
            radius: alerts.attendanceRadius
          }}
        />

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button onClick={onCancel ?? (() => {})} color="inherit">취소</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={form.submitting || form.isSubmitDisabled || Object.values(alerts).some(Boolean)}
            sx={{ bgcolor: '#ff7c33', ':hover': { bgcolor: '#ff6a14' } }}
          >
            {submitLabel}
          </Button>
        </Stack>
      </Stack>

      <LocationModal
        open={form.locationModalOpen}
        onClose={() => form.setLocationModalOpen(false)}
        {...{
          province: form.province,
          setProvince: form.setProvince,
          city: form.city,
          setCity: form.setCity,
          placeName: form.locationName,
          setPlaceName: form.setLocationName,
          latitude: form.latitude,
          setLatitude: form.setLatitude,
          longitude: form.longitude,
          setLongitude: form.setLongitude
        }}
      />
    </Box>
  );
}
