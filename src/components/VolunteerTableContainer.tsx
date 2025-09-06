// src/components/VolunteerTable.tsx
import React, { useMemo, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Stack, Box, TextField, Typography, Autocomplete,
  ToggleButton, ToggleButtonGroup, TableSortLabel
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import VolunteerDetailModal from './volunteer-detail/VolunteerDetailModal';
import type { ListPost } from '../types/volunteer';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';

type DetailPost = React.ComponentProps<typeof VolunteerDetailModal>['data'];

function toDetailData(p: ListPost): DetailPost {
  return {
    id: p.id,
    title: p.title,
    content: '',
    status: p.status,
    totalCapacity: Number(p.capacity) || 0,
    teamCount: 5,
    perTeamCapacity: 0,
    appliedCount: Number(p.appliedCount) || 0,
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
    minAttendanceMinutes: 0,
    teams: [],
  };
}

function splitRegion(location: string) {
  const [city = '', district = ''] = location.split(' ');
  return { city, district };
}

type SortKey = 'volunteerDate' | 'recruitment';
type SortDir = 'asc' | 'desc';
const toISODate = (d: Dayjs | null) => (d ? d.format('YYYY-MM-DD') : '');

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
};

export default function VolunteerTable({ rows, onRowClick, onSearch }: VolunteerTableProps) {
  const [selectedPost, setSelectedPost] = useState<DetailPost | null>(null);
  const [open, setOpen] = useState(false);

  // 서버에 전달할 필터 상태 (조회 버튼 눌러야만 사용)
  const [cityFilter, setCityFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [volStart, setVolStart] = useState<Dayjs | null>(null);
  const [volEnd, setVolEnd] = useState<Dayjs | null>(null);
  const [volFrom, setVolFrom] = useState('');
  const [volTo, setVolTo] = useState('');

  // 클라이언트 정렬 상태(표시에만 사용)
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // 옵션(현재 표시 중인 rows 기준)
  const cityOptions = useMemo(
    () => Array.from(new Set(rows.map(p => splitRegion(p.location).city))).filter(Boolean),
    [rows]
  );
  const districtOptions = useMemo(() => {
    const districts = rows
      .filter(p => !cityFilter || splitRegion(p.location).city === cityFilter)
      .map(p => splitRegion(p.location).district);
    return Array.from(new Set(districts)).filter(Boolean);
  }, [rows, cityFilter]);
  const categoryOptions = useMemo(
    () => Array.from(new Set(rows.map(p => p.category))),
    [rows]
  );

  // 클라이언트 정렬만 수행 (필터링 없음)
  const sortedRows = useMemo(() => {
    const data = [...rows];
    if (!sortKey) return data;
    data.sort((a, b) => {
      let va = '', vb = '';
      if (sortKey === 'volunteerDate') {
        va = a.volunteerDate; vb = b.volunteerDate;
      } else {
        va = a.recruitmentEndDate; vb = b.recruitmentEndDate;
      }
      if (va === vb) return 0;
      return sortDir === 'asc' ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1);
    });
    return data;
  }, [rows, sortKey, sortDir]);

  const handleOpen = (post: ListPost) => {
    if (onRowClick) {
      onRowClick(post.id);
      return;
    }
    setSelectedPost(toDetailData(post));
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedPost(null);
  };

  const resetFilters = () => {
    setCityFilter('');
    setDistrictFilter('');
    setStatusFilter('');
    setCategoryFilter('');
    setVolStart(null);
    setVolEnd(null);
    setVolFrom('');
    setVolTo('');
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    }
  };

  const handleSearch = () => {
    onSearch?.({
      province: cityFilter || undefined,
      city: districtFilter || undefined,
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
      volunteerFrom: volFrom || undefined,
      volunteerTo: volTo || undefined,
    });
  };

  const LabelRow: React.FC<{
    label: string;
    children: React.ReactNode;
    stretch?: boolean;
    minWidth?: number;
  }> = ({ label, children, stretch = true, minWidth = 420 }) => (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2.5}
      sx={{ minWidth: { xs: '100%', md: minWidth } }}
    >
      <Typography
        variant="body2"
        sx={{ width: 84, color: 'text.primary', fontWeight: 600, textAlign: 'right' }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: stretch ? 1 : '0 0 auto' }}>{children}</Box>
    </Stack>
  );

  return (
    <>
      {/* 필터 영역 (조회 버튼 눌러야만 서버로 전송) */}
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
              <Autocomplete
                size="small"
                sx={{ minWidth: 160 }}
                options={cityOptions}
                value={cityFilter || null}
                onChange={(_, v) => {
                  setCityFilter(v ?? '');
                  setDistrictFilter('');
                }}
                renderInput={(params) => <TextField {...params} placeholder="시/도" />}
                clearOnEscape
              />
              <Autocomplete
                size="small"
                sx={{ minWidth: 160 }}
                options={districtOptions}
                value={districtFilter || null}
                onChange={(_, v) => setDistrictFilter(v ?? '')}
                renderInput={(params) => <TextField {...params} placeholder="구/군" />}
                disabled={!cityFilter}
                clearOnEscape
              />
            </Stack>
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
              options={categoryOptions}
              value={categoryFilter || null}
              onChange={(_, v) => setCategoryFilter(v ?? '')}
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
                    textField: {
                      size: 'small',
                      placeholder: '시작일',
                      sx: {
                        minWidth: 160,
                        '& .MuiOutlinedInput-root': { borderTopRightRadius: 0, borderBottomRightRadius: 0 },
                        '& .MuiOutlinedInput-notchedOutline': { borderRight: '0 !important' },
                      },
                    },
                  }}
                />
                <Box sx={{ px: 1, color: 'text.secondary', userSelect: 'none' }}>~</Box>
                <DatePicker
                  value={volEnd}
                  onChange={(v) => { setVolEnd(v); setVolTo(toISODate(v)); }}
                  format="YYYY/MM/DD"
                  slotProps={{
                    textField: {
                      size: 'small',
                      placeholder: '종료일',
                      sx: {
                        minWidth: 160,
                        ml: '-1px',
                        '& .MuiOutlinedInput-root': { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
                      },
                    },
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
            <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearch}>
              조회
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* 표시는 서버에서 받은 rows에 대해 **정렬만** 적용 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#ff7c33' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff' }} align="center">제목</TableCell>
              <TableCell
                sx={{ color: '#fff' }}
                align="center"
                sortDirection={sortKey === 'volunteerDate' ? sortDir : false}
              >
                <TableSortLabel
                  active={sortKey === 'volunteerDate'}
                  direction={sortKey === 'volunteerDate' ? sortDir : 'asc'}
                  onClick={() => toggleSort('volunteerDate')}
                  sx={{
                    color: '#fff',
                    '&.Mui-active': { color: '#fff' },
                    '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                    '&:hover': { color: '#fff' },
                  }}
                >
                  봉사 일자
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#fff' }} align="center">지역</TableCell>
              <TableCell sx={{ color: '#fff' }} align="center">봉사 유형</TableCell>
              <TableCell sx={{ color: '#fff', whiteSpace: 'pre-line', lineHeight: 1.2 }} align="center">
                {'모집 인원'}
              </TableCell>
              <TableCell
                sx={{ color: '#fff' }}
                align="center"
                sortDirection={sortKey === 'recruitment' ? sortDir : false}
              >
                <TableSortLabel
                  active={sortKey === 'recruitment'}
                  direction={sortKey === 'recruitment' ? sortDir : 'asc'}
                  onClick={() => toggleSort('recruitment')}
                  sx={{
                    color: '#fff',
                    '&.Mui-active': { color: '#fff' },
                    '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                    '&:hover': { color: '#fff' },
                  }}
                >
                  모집 일정
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: '#fff' }} align="center">상태</TableCell>
              <TableCell sx={{ color: '#fff' }} align="center">상세보기</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedRows.map((post) => (
              <TableRow key={post.id} hover>
                <TableCell align="center">{post.title}</TableCell>
                <TableCell align="center">{post.volunteerDate}</TableCell>
                <TableCell align="center">{post.location}</TableCell>
                <TableCell align="center">{post.category}</TableCell>
                <TableCell align="center">{post.appliedCount} / {post.capacity}</TableCell>
                <TableCell align="center">
                  {post.recruitmentStartDate} ~ {post.recruitmentEndDate}
                </TableCell>
                <TableCell align="center">{post.status}</TableCell>
                <TableCell align="center">
                  <Button variant="outlined" onClick={() => handleOpen(post)}>상세 보기</Button>
                </TableCell>
              </TableRow>
            ))}
            {sortedRows.length === 0 && (
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
