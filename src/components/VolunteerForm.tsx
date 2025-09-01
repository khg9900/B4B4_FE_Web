// src/components/VolunteerForm.tsx
import { useMemo, useState } from 'react';
import {
  Box, Stack, TextField, FormControl, InputLabel, Select, MenuItem,
  Button, Typography, InputAdornment, Alert
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { POST_CATEGORIES, type PostCategory, type CreatePostRequest } from '../types/volunteer';

/** 백엔드 Enum 매핑 (KO → EN) */
const CAT_KO_TO_EN: Record<PostCategory, 'RECRUITMENT' | 'SUPPORT'> = {
  '봉사활동 모집': 'RECRUITMENT',
  '구호물품 지원': 'SUPPORT',
};

type Props = {
  /** 등록 API. (payload는 백엔드 CreatePostRequest 구조) */
  createApi: (payload: CreatePostRequest) => Promise<any>;
  /** 제출 성공 시 콜백 */
  onSubmitSuccess?: (created: any) => void;
  /** 취소 버튼 클릭 */
  onCancel?: () => void;
  /** 모달 내부에 버튼 렌더링 여부 */
  showButtons?: boolean;
  /** 외곽 카드 프레임 표시 여부 (모달 내부 사용 시 false 권장) */
  framed?: boolean;
  /** 제출 버튼 라벨 */
  submitLabel?: string;
};

export default function VolunteerForm({
  createApi,
  onSubmitSuccess,
  onCancel,
  showButtons = true,
  framed = false,
  submitLabel = '등록',
}: Props) {
  // --- 폼 상태 ---
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('봉사활동 모집');

  // 일정
  const [volunteerDate, setVolunteerDate] = useState('');           // YYYY-MM-DD
  const [volunteerStartTime, setVolunteerStartTime] = useState(''); // HH:mm
  const [volunteerEndTime, setVolunteerEndTime] = useState('');     // HH:mm

  const [recruitmentStartDate, setRecruitmentStartDate] = useState(''); // YYYY-MM-DD
  const [recruitmentEndDate, setRecruitmentEndDate] = useState('');     // YYYY-MM-DD

  // 위치 (분리 입력)
  const [province, setProvince] = useState(''); // 시/도
  const [city, setCity] = useState('');         // 구/군
  const [placeName, setPlaceName] = useState('');

  // ⬇️ 위/경도: 문자열로 받아서 스피너 제거 + 소수 자유 입력
  const [latitude, setLatitude] = useState<string>('');   // 예: "37.4979"
  const [longitude, setLongitude] = useState<string>(''); // 예: "127.0276"

  // 인원/팀
  const [totalCapacity, setTotalCapacity] = useState<number | ''>('');
  const [teamCount, setTeamCount] = useState<number | ''>(''); // 사용자가 입력: "팀 개수"

  // 출석 정책
  const [attendanceStartTime, setAttendanceStartTime] = useState(''); // HH:mm
  const [attendanceEndTime, setAttendanceEndTime] = useState('');     // HH:mm
  const [attendanceRadius, setAttendanceRadius] = useState<number | ''>(100); // ⬅️ 기본값 100

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 팀당 정원(= teamSize)
  const perTeam = useMemo(() => {
    const total = typeof totalCapacity === 'number' ? totalCapacity : NaN;
    const teams = typeof teamCount === 'number' ? teamCount : NaN;
    if (!Number.isFinite(total) || !Number.isFinite(teams) || teams <= 0) return 0;
    return Math.floor(total / teams);
  }, [totalCapacity, teamCount]);

  // --- 유효성/제출 가능 여부 ---
  const allRequiredFilled = useMemo(() => {
    const reqStrings = [
      title, content, volunteerDate, volunteerStartTime, volunteerEndTime,
      recruitmentStartDate, recruitmentEndDate, province, city, category,
      attendanceStartTime, attendanceEndTime,
    ];
    const reqNumbersOk =
      typeof totalCapacity === 'number' && totalCapacity > 0 &&
      typeof teamCount === 'number' && teamCount > 0 &&
      typeof attendanceRadius === 'number' && attendanceRadius >= 100; // ⬅️ 최소 100

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

  // --- 헬퍼들 ---
  /** 'HH:mm' → 'HH:mm:ss' */
  const toHHmmss = (t: string) => (t && /^\d{2}:\d{2}$/.test(t) ? `${t}:00` : t || '00:00:00');

  /** HH:mm → 'YYYY-MM-DDTHH:mm:00' */
  const toIsoDateTime = (date: string, hhmm: string) =>
    `${date}T${hhmm && hhmm.length === 5 ? hhmm : '00:00'}:00`;

  // --- 제출 ---
  const handleSubmit = async () => {
    setErrorMsg('');
    if (!isValid) {
      setErrorMsg(divisible ? '필수 항목을 모두 입력하세요.' : '총 인원은 팀 개수로 나누어떨어져야 합니다.');
      return;
    }
    setSubmitting(true);
    try {
      // 위/경도 문자열 → number (실패 시 0)
      const latNum = Number.isFinite(parseFloat(latitude)) ? parseFloat(latitude) : 0;
      const lngNum = Number.isFinite(parseFloat(longitude)) ? parseFloat(longitude) : 0;

      // 백엔드 CreatePostRequest 규격으로 페이로드 구성
      const payload: CreatePostRequest = {
        title,
        content,
        volunteerDate,                                   // YYYY-MM-DD
        volunteerStartTime: toHHmmss(volunteerStartTime), // HH:mm:ss
        volunteerEndTime:   toHHmmss(volunteerEndTime),   // HH:mm:ss
        recruitmentStartDate,
        recruitmentEndDate,
        totalCapacity: totalCapacity as number,
        // teamSize는 "팀당 정원"이어야 함 (총 인원 / 팀 개수)
        teamSize: perTeam,
        category: CAT_KO_TO_EN[category],
        location: {
          province,
          city,
          placeName: placeName || '',
          latitude: latNum,
          longitude: lngNum,
        },
        attendancePolicy: {
          checkinStart: toIsoDateTime(volunteerDate, attendanceStartTime),
          checkinEnd:   toIsoDateTime(volunteerDate, attendanceEndTime),
          allowedRadiusM: typeof attendanceRadius === 'number' ? attendanceRadius : 100,
        },
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

        {/* 위치: 시/도, 구/군, 장소명, 좌표(선택) */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="시/도"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          />
          <TextField
            fullWidth
            label="구/군"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </Stack>
        <TextField
          fullWidth
          label="상세 장소명"
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
        />

        {/* 위도/경도: 소수 입력 + 스피너 없음 */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="위도"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            inputMode="decimal"
            placeholder="예: 37.4979"
          />
          <TextField
            fullWidth
            label="경도"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            inputMode="decimal"
            placeholder="예: 127.0276"
          />
        </Stack>

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
    </Box>
  );
}
