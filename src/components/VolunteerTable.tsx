// src/components/VolunteerTable.tsx
import React, { useMemo, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Stack, Box, TextField, Typography, Autocomplete,
  ToggleButton, ToggleButtonGroup, Select, MenuItem
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import VolunteerDetailModal from './volunteer-detail/VolunteerDetailModal';
import type { ListPost, PostCategory } from '../types/volunteer'; // ← PostCategory 추가

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';

import useRegionsCsv from '../hooks/useRegionsCsv'; // ← CSV 훅

type DetailPost = React.ComponentProps<typeof VolunteerDetailModal>['data'];

// 하드코딩 카테고리 옵션
const CATEGORY_OPTIONS: PostCategory[] = ['봉사활동 모집', '구호물품 지원'] as const;

function toDetailData(p: ListPost): DetailPost {
  return {
    id: p.id,
    title: p.title,
    content: '',
    category: p.category,
    status: p.status,
    totalCapacity: Number((p as any).totalCapacity ?? 0),
    location: p.location,
    placeName: '',
    latitude: 0,
    longitude: 0,
    recruitmentStartDate: p.recruitmentStartDate,
    recruitmentEndDate: p.recruitmentEndDate,
    volunteerDate: p.volunteerDate,
    volunteerStartTime: '',
    attendanceStartTime: '',
    attendanceEndTime: '',
    attendanceRadius: 0,
  };
}

type VolunteerTableProps = {
  rows: ListPost[];
  onRowClick?: (id: number) => void;
  onSearch?: (filters: {
    province?: string;
    city?: string;
    status?: string;
    category?: string;
    volunteerFrom?: string;
    volunteerTo?: string;
  }) => void;
  page?: number;
  size?: number;
  onSizeChange?: (size: number) => void;
};

const toISODate = (d: Dayjs | null) => (d ? d.format('YYYY-MM-DD') : '');

export default function VolunteerTable({
  rows,
  onRowClick,
  onSearch,
  page = 0,
  size = 20,
  onSizeChange,
}: VolunteerTableProps) {
  const [selectedPost, setSelectedPost] = useState<DetailPost | null>(null);
  const [open, setOpen] = useState(false);

  // 🔹 CSV에서 지역 옵션 로드
  const { provinces, citiesByProvince, loading: regionLoading, error: regionError } = useRegionsCsv('/regions.csv');

  // ── 상단 필터 상태 ──
  const [provinceFilter, setProvinceFilter] = useState<string>(''); // 시/도
  const [cityFilter, setCityFilter] = useState<string>('');         // 시·군·구
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [volStart, setVolStart] = useState<Dayjs | null>(null);
  const [volEnd, setVolEnd] = useState<Dayjs | null>(null);
  const [volFrom, setVolFrom] = useState<string>('');
  const [volTo, setVolTo] = useState<string>('');

  // 시/도 선택에 따른 시·군·구 옵션
  const cityOptions = useMemo(() => {
    if (!provinceFilter) return [];
    return citiesByProvince[provinceFilter] ?? [];
  }, [citiesByProvince, provinceFilter]);

  const handleOpen = (post: ListPost) => {
    if (onRowClick) { onRowClick(post.id); return; }
    setSelectedPost(toDetailData(post));
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setSelectedPost(null); };

  const resetFilters = () => {
    setProvinceFilter(''); setCityFilter('');
    setStatusFilter(''); setCategoryFilter('');
    setVolStart(null); setVolEnd(null);
    setVolFrom(''); setVolTo('');
  };

  const handleSizeSelect = (e: SelectChangeEvent<string>) => {
    const n = parseInt(e.target.value, 10) || 20;
    onSizeChange?.(n);
  };

  const LabelRow: React.FC<{
    label: string;
    children: React.ReactNode;
    stretch?: boolean;
    minWidth?: number;
  }> = ({ label, children, stretch = true, minWidth = 420 }) => (
    <Stack direction="row" alignItems="center" spacing={2.5} sx={{ minWidth: { xs: '100%', md: minWidth } }}>
      <Typography variant="body2" sx={{ width: 84, color: 'text.primary', fontWeight: 600, textAlign: 'right' }}>
        {label}
      </Typography>
      <Box sx={{ flex: stretch ? 1 : '0 0 auto' }}>{children}</Box>
    </Stack>
  );

  return (
    <>
      {/* ── 필터 영역 ── */}
      <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }} elevation={0}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          useFlexGap
          flexWrap="wrap"
        >
          <LabelRow label="봉사 지역">
            <Stack direction="row" spacing={1.25}>
              {/* 시/도 (CSV 기반) */}
              <Autocomplete
                size="small"
                sx={{ minWidth: 160 }}
                options={provinces}
                loading={regionLoading}
                value={provinceFilter || null}
                onChange={(_, v) => { setProvinceFilter(v ?? ''); setCityFilter(''); }}
                renderInput={(params) => <TextField {...params} placeholder="시/도" />}
                clearOnEscape
              />
              {/* 시·군·구 (CSV 기반) */}
              <Autocomplete
                size="small"
                sx={{ minWidth: 160 }}
                options={cityOptions}
                loading={regionLoading}
                value={cityFilter || null}
                onChange={(_, v) => setCityFilter(v ?? '')}
                renderInput={(params) => <TextField {...params} placeholder="시/군/구" />}
                disabled={!provinceFilter || (citiesByProvince[provinceFilter]?.length ?? 0) === 0}
                clearOnEscape
              />
            </Stack>
            {regionError && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                지역 목록을 불러오지 못했습니다: {regionError}
              </Typography>
            )}
          </LabelRow>

          <LabelRow label="상태" minWidth={360} stretch={false}>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={statusFilter || ''}
              onChange={(_, v) => setStatusFilter(v ?? '')}
              color="standard"
              sx={{
                columnGap: 1.3,
                '& .MuiToggleButton-root': {
                  px: 1.7,
                  textTransform: 'none',
                  borderRadius: 999,
                  border: '1px solid',
                  borderColor: 'divider',
                  color: 'text.primary',
                  backgroundColor: '#fff',
                },
                '& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover': {
                  color: '#ff7c33',
                  borderColor: '#ff7c33',
                  backgroundColor: '#fff',
                },
              }}
            >
              <ToggleButton value="">전체</ToggleButton>
              <ToggleButton value="모집 중">모집 중</ToggleButton>
              <ToggleButton value="모집 마감">모집 마감</ToggleButton>
              <ToggleButton value="봉사 완료">봉사 완료</ToggleButton>
            </ToggleButtonGroup>
          </LabelRow>

          <LabelRow label="봉사 유형" stretch={false} minWidth={260}>
            <Autocomplete
              size="small"
              sx={{ width: 200 }}
              options={CATEGORY_OPTIONS as readonly PostCategory[]}
              value={(categoryFilter as PostCategory) || null}
              onChange={(_, v) => setCategoryFilter((v as PostCategory) ?? '')}
              renderInput={(params) => <TextField {...params} placeholder="유형 선택" />}
              clearOnEscape
            />
          </LabelRow>

          <LabelRow label="봉사 일자">
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
              <Stack direction="row" alignItems="center" sx={{ minWidth: 330 }}>
                <DatePicker
                  value={volStart}
                  onChange={(v) => { setVolStart(v); setVolFrom(toISODate(v)); }}
                  format="YYYY/MM/DD"
                  slotProps={{
                    textField: { size: 'small', placeholder: '시작일', sx: { minWidth: 160 } },
                  }}
                />
                <Box sx={{ px: 1, color: 'text.secondary', userSelect: 'none' }}>~</Box>
                <DatePicker
                  value={volEnd}
                  onChange={(v) => { setVolEnd(v); setVolTo(toISODate(v)); }}
                  format="YYYY/MM/DD"
                  slotProps={{
                    textField: { size: 'small', placeholder: '종료일', sx: { minWidth: 160 } },
                  }}
                />
              </Stack>
            </LocalizationProvider>
          </LabelRow>

          <Box sx={{ flex: 1 }} />
          <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
            <Button variant="text" color="inherit" startIcon={<RestartAltIcon />} onClick={resetFilters}>
              초기화
            </Button>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={() =>
                onSearch?.({
                  province: provinceFilter || undefined,
                  city: cityFilter || undefined,
                  status: statusFilter || undefined,
                  category: categoryFilter || undefined,
                  volunteerFrom: volFrom || undefined,
                  volunteerTo: volTo || undefined,
                })
              }
            >
              조회
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* 필터 아래 · 테이블 위 컨트롤 */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          페이지 {page + 1}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">표시 개수</Typography>
          <Select size="small" value={String(size)} onChange={handleSizeSelect} sx={{ minWidth: 88 }}>
            <MenuItem value="10">10개</MenuItem>
            <MenuItem value="20">20개</MenuItem>
            <MenuItem value="30">30개</MenuItem>
            <MenuItem value="50">50개</MenuItem>
          </Select>
        </Stack>
      </Stack>

      {/* 테이블 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#ff7c33' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff' }} align="center">제목</TableCell>
              <TableCell sx={{ color: '#fff' }} align="center">봉사 일자</TableCell>
              <TableCell sx={{ color: '#fff' }} align="center">지역</TableCell>
              <TableCell sx={{ color: '#fff' }} align="center">봉사 유형</TableCell>
              <TableCell sx={{ color: '#fff', whiteSpace: 'pre-line', lineHeight: 1.2 }} align="center">모집 인원</TableCell>
              <TableCell sx={{ color: '#fff' }} align="center">모집 일정</TableCell>
              <TableCell sx={{ color: '#fff' }} align="center">상태</TableCell>
              <TableCell sx={{ color: '#fff' }} align="center">상세보기</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((post) => (
              <TableRow key={post.id} hover>
                <TableCell align="center">{post.title}</TableCell>
                <TableCell align="center">{post.volunteerDate}</TableCell>
                <TableCell align="center">{post.location}</TableCell>
                <TableCell align="center">{post.category}</TableCell>
                <TableCell align="center">
                  {(post as any).appliedCount != null
                    ? `${(post as any).appliedCount} / ${(post as any).capacity ?? (post as any).totalCapacity}`
                    : (post as any).totalCapacity}
                </TableCell>
                <TableCell align="center">
                  {post.recruitmentStartDate} ~ {post.recruitmentEndDate}
                </TableCell>
                <TableCell align="center">{post.status}</TableCell>
                <TableCell align="center">
                  <Button variant="outlined" onClick={() => handleOpen(post)}>상세 보기</Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  조건에 해당하는 게시글이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!onRowClick && selectedPost && (
        <VolunteerDetailModal open={open} onClose={handleClose} data={selectedPost} />
      )}
    </>
  );
}
