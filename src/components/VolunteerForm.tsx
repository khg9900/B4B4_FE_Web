// src/components/VolunteerForm.tsx
import { useMemo, useState } from 'react';
import {
  Box, Stack, TextField, FormControl, InputLabel, Select, MenuItem,
  Button, Typography, InputAdornment, Alert, Modal
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { POST_CATEGORIES, type PostCategory, type CreatePostRequest } from '../types/volunteer';
import LocationPicker from './LocationPicker';

/** 백엔드 Enum 매핑 (KO → EN) */
const CAT_KO_TO_EN: Record<PostCategory, 'RECRUITMENT' | 'SUPPORT'> = {
  '봉사활동 모집': 'RECRUITMENT',
  '구호물품 지원': 'SUPPORT',
};

type Props = {
  createApi: (payload: CreatePostRequest) => Promise<any>;
  onSubmitSuccess?: (created: any) => void;
  onCancel?: () => void;
  showButtons?: boolean;
  framed?: boolean;
  submitLabel?: string;
};

export default function VolunteerForm({
  createApi,
  onSubmitSuccess,
  onCancel,
  showButtons = true,
  framed = false,
  submitLabel = '등록'
}: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('봉사활동 모집');

  const [volunteerDate, setVolunteerDate] = useState('');
  const [volunteerStartTime, setVolunteerStartTime] = useState('');
  const [volunteerEndTime, setVolunteerEndTime] = useState('');

  const [recruitmentStartDate, setRecruitmentStartDate] = useState('');
  const [recruitmentEndDate, setRecruitmentEndDate] = useState('');

  const [province, setProvince] = useState('');
  const [city, setCity] = useState<string | null>(''); // city null 처리 가능
  const [placeName, setPlaceName] = useState('');

  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');

  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const [totalCapacity, setTotalCapacity] = useState<number | ''>('');
  const [teamCount, setTeamCount] = useState<number | ''>('');

  const [attendanceStartTime, setAttendanceStartTime] = useState('');
  const [attendanceEndTime, setAttendanceEndTime] = useState('');
  const [attendanceRadius, setAttendanceRadius] = useState<number | ''>(100);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const perTeam = useMemo(() => {
    const total = typeof totalCapacity === 'number' ? totalCapacity : NaN;
    const teams = typeof teamCount === 'number' ? teamCount : NaN;
    if (!Number.isFinite(total) || !Number.isFinite(teams) || teams <= 0) return 0;
    return Math.floor(total / teams);
  }, [totalCapacity, teamCount]);

  const allRequiredFilled = useMemo(() => {
    const reqStrings = [
      title, content, volunteerDate, volunteerStartTime, volunteerEndTime,
      recruitmentStartDate, recruitmentEndDate, province, category,
      attendanceStartTime, attendanceEndTime
    ];
    const reqNumbersOk =
      typeof totalCapacity === 'number' && totalCapacity > 0 &&
      typeof teamCount === 'number' && teamCount > 0 &&
      typeof attendanceRadius === 'number' && attendanceRadius >= 100 &&
      city !== null; // city null 체크
    return reqStrings.every(Boolean) && reqNumbersOk;
  }, [
    title, content, volunteerDate, volunteerStartTime, volunteerEndTime,
    recruitmentStartDate, recruitmentEndDate, province, city, category,
    attendanceStartTime, attendanceEndTime, totalCapacity, teamCount, attendanceRadius
  ]);

  const divisible = useMemo(() => {
    if (typeof totalCapacity !== 'number' || typeof teamCount !== 'number' || teamCount <= 0) return false;
    return totalCapacity % teamCount === 0;
  }, [totalCapacity, teamCount]);

  const isValid = allRequiredFilled && divisible;

  const toHHmmss = (t: string) => (t && /^\d{2}:\d{2}$/.test(t) ? `${t}:00` : t || '00:00:00');
  const toIsoDateTime = (date: string, hhmm: string) =>
     `${date}T${hhmm && hhmm.length === 5 ? hhmm : '00:00'}:00`;

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!isValid) {
      setErrorMsg(divisible ? '필수 항목을 모두 입력하세요.' : '총 인원은 팀 개수로 나누어떨어져야 합니다.');
      return;
    }
    setSubmitting(true);
    try {
      const latNum = Number.isFinite(parseFloat(latitude)) ? parseFloat(latitude) : 0;
      const lngNum = Number.isFinite(parseFloat(longitude)) ? parseFloat(longitude) : 0;

      const payload: CreatePostRequest = {
        title, content, volunteerDate,
        volunteerStartTime: toHHmmss(volunteerStartTime),
        volunteerEndTime: toHHmmss(volunteerEndTime),
        recruitmentStartDate, recruitmentEndDate,
        totalCapacity: totalCapacity as number,
        teamSize: perTeam,
        category: CAT_KO_TO_EN[category],
        location: { 
          province,
          city: city || '',
          placeName: placeName || '',
          latitude: latNum,
          longitude: lngNum 
        },
        attendancePolicy: {
          checkinStart: toIsoDateTime(volunteerDate, attendanceStartTime),
          checkinEnd: toIsoDateTime(volunteerDate, attendanceEndTime),
          allowedRadiusM: typeof attendanceRadius === 'number' ? attendanceRadius : 100
        }
      };

      const created = await createApi(payload);
      onSubmitSuccess?.(created);
    } catch (e: any) {
      setErrorMsg(e?.message || '등록 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={framed ? { p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 } : undefined}>
      <Stack spacing={2.5}>
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        {/* 제목/카테고리 */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel id="cat-label">카테고리</InputLabel>
            <Select<PostCategory>
              labelId="cat-label"
              label="카테고리"
              value={category}
              onChange={(e: SelectChangeEvent<PostCategory>) =>
                setCategory(e.target.value as PostCategory)
              }
            >
              {POST_CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* 내용 */}
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="봉사 내용, 준비물, 유의사항 등을 입력하세요."
        />

        {/* 봉사 일자 / 시작·종료 */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            type="date"
            label="봉사 일자"
            value={volunteerDate}
            onChange={(e) => setVolunteerDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            type="time"
            label="시작 시간"
            value={volunteerStartTime}
            onChange={(e) => setVolunteerStartTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            type="time"
            label="종료 시간"
            value={volunteerEndTime}
            onChange={(e) => setVolunteerEndTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        {/* 모집 기간 */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>

          <TextField
            fullWidth
            type="date"
            label="모집 시작"
            value={recruitmentStartDate}
            onChange={(e) => setRecruitmentStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            type="date"
            label="모집 마감"
            value={recruitmentEndDate}
            onChange={(e) => setRecruitmentEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
          
        {/* 위치 선택 */}
        <Button variant="outlined" onClick={() => setLocationModalOpen(true)}>위치 선택</Button>

        {/* 지역/상세 장소/좌표 박스 */}
        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Stack spacing={2}>
            {/* 지역 */}
            <TextField
              fullWidth
              label="지역 (예: 서울특별시 관악구)"
              name="location"
              value={province ? (city ? `${province} ${city}` : province) : ''}
              disabled
            />

            {/* 상세 장소 */}
            <TextField
              fullWidth
              label="상세 장소명"
              name="placeName"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
            />

            {/* 좌표 */}
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              좌표: 위도 {latitude ? parseFloat(latitude).toFixed(4) : '-'}, 
              경도 {longitude ? parseFloat(longitude).toFixed(4) : '-'}
            </Typography>
          </Stack>
        </Box>

        {/* 인원/팀 (팀 개수 설정 → 팀당 정원 자동 계산) */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            type="number"
            inputProps={{ min: 1 }}
            label="총 인원"
            value={totalCapacity}
            onChange={(e) => setTotalCapacity(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <TextField
            fullWidth
            type="number"
            inputProps={{ min: 1 }}
            label="팀 개수"
            value={teamCount}
            onChange={(e) => setTeamCount(e.target.value === '' ? '' : Number(e.target.value))}
            helperText={
              typeof totalCapacity === 'number' && typeof teamCount === 'number' && teamCount > 0
                ? (divisible
                    ? `팀당 정원 자동 계산: ${perTeam}명`
                    : '총 인원이 팀 개수로 나누어떨어지지 않습니다.')
                : '팀 개수를 입력하면 팀당 정원이 자동 계산됩니다.'
            }
            error={Boolean(totalCapacity) && Boolean(teamCount) && !divisible}
          />
        </Stack>

        {/* 출석 정책 */}
        <Typography variant="h6" sx={{ mt: 1 }}>
          출석 정책
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            type="time"
            label="출석 시작 시간"
            value={attendanceStartTime}
            onChange={(e) => setAttendanceStartTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            type="time"
            label="출석 종료 시간"
            value={attendanceEndTime}
            onChange={(e) => setAttendanceEndTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            type="number"
            inputProps={{ min: 100 }} // ⬅️ 최소 100
            label="출석 인정 반경"
            value={attendanceRadius}
            onChange={(e) => setAttendanceRadius(e.target.value === '' ? '' : Number(e.target.value))}
            InputProps={{ endAdornment: <InputAdornment position="end">m</InputAdornment> }}
            helperText="최소 100m 이상"
            error={typeof attendanceRadius === 'number' && attendanceRadius < 100}
          />
        </Stack>

        {showButtons && (
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button onClick={onCancel} color="inherit">취소</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              sx={{ bgcolor: '#ff7c33', ':hover': { bgcolor: '#ff6a14' } }}
            >
              {submitLabel}
            </Button>
          </Stack>
        )}
      </Stack>

      {/* 위치 선택 모달 */}
      <Modal open={locationModalOpen} onClose={() => setLocationModalOpen(false)}>
        <Box sx={{ width: 500, bgcolor: 'white', p: 2, mx: 'auto', mt: '10%', borderRadius: 2 }}>
          <LocationPicker
            province={province}
            city={city}
            placeName={placeName}
            latitude={latitude}
            longitude={longitude}
            setProvince={setProvince}
            setCity={setCity}
            setPlaceName={setPlaceName}
            setLatitude={setLatitude}
            setLongitude={setLongitude}
            modalOpen={locationModalOpen}
          />
          <Button onClick={() => setLocationModalOpen(false)} sx={{ mt: 2 }}>닫기</Button>
        </Box>
      </Modal>
    </Box>
  );
}
