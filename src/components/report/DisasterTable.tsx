import {
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import DisasterDetailModal from './DisasterDetailModal';
import {
  type ReportDto,
  type ReportStatusEN,
  DISASTER_TYPE_KO,
  REPORT_STATUS_KO,
} from '../../types/report';
import { fetchReportsSlice, updateReportStatus } from '../../api/reports';
import { getMyInfoCached } from '../../api/user';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const getStatusColor = (status: ReportStatusEN) => {
  switch (status) {
    case 'PENDING':
      return '#ff7c33';
    case 'RECEIVED':
      return '#2196f3';
    case 'CLOSED':
      return '#757575';
    default:
      return 'inherit';
  }
};

export default function DisasterTable() {
  const [query, setQuery] = useState<{
    province: string;
    city: string; 
    status?: ReportStatusEN;
    page: number;
    size: number;
  }>({
    province: '',
    city: '',
    page: 0,
    size: 10,
  });

  const [items, setItems] = useState<ReportDto[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReportStatusEN>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<ReportDto | null>(null);

  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const me = await getMyInfoCached();
        if (ignore) return;
        const province = me.province || '';
        const city = me.city || '';
        setQuery((q) => ({
          ...q,
          province,
          city,
          page: 0,
        }));
        if (province && city) window.scrollTo({ top: 0, behavior: 'auto' });
      } catch (e) {
        console.error('[DisasterTable] getMyInfoCached failed:', e);
      }
    })();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    setQuery((q) => ({
      ...q,
      page: 0,
      status: statusFilter === 'ALL' ? undefined : (statusFilter as ReportStatusEN),
    }));
  }, [statusFilter]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [query.page]);

  const load = useCallback(async () => {
    if (!query.province) return;

    try {
      setLoading(true);
      setErrorMsg('');
      const slice = await fetchReportsSlice({
        province: query.province,
        city: query.city ?? '',
        status: query.status,
        page: query.page,
        size: query.size,
      });
      setItems(slice.content);
      setHasNext(slice.hasNext);

      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (e: any) {
      setErrorMsg(e?.message || '목록 조회 실패');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  const openModal = (row: ReportDto) => {
    setSelected(row);
    setModalOpen(true);
  };
  const closeModal = () => {
    setSelected(null);
    setModalOpen(false);
  };

  const handleStatusChange = async (id: number, newStatus: ReportStatusEN) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    if (selected?.id === id) setSelected({ ...selected, status: newStatus });

    try {
      await updateReportStatus(id, newStatus);
    } catch (e) {
      await load();
      console.error(e);
    }
  };

  const goPrev = () => setQuery((q) => ({ ...q, page: Math.max(0, q.page - 1) }));
  const goNext = () => hasNext && setQuery((q) => ({ ...q, page: q.page + 1 }));

  return (
    <Box px={3} py={2} sx={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div ref={topRef} />

      {/* 타이틀 */}
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
        재난 신고 목록
      </Typography>

      {/* 페이지 라벨(좌) + 필터/표시개수(우) */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        mb={1.5}
      >
        <Typography variant="body2" color="text.secondary">
          페이지 {query.page + 1}
        </Typography>

        <Stack direction="row" spacing={1.5}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="status-label">접수 상태</InputLabel>
            <Select
              labelId="status-label"
              label="접수 상태"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <MenuItem value="ALL">전체</MenuItem>
              <MenuItem value="PENDING">{REPORT_STATUS_KO.PENDING}</MenuItem>
              <MenuItem value="RECEIVED">{REPORT_STATUS_KO.RECEIVED}</MenuItem>
              <MenuItem value="CLOSED">{REPORT_STATUS_KO.CLOSED}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel id="size-label">표시 개수</InputLabel>
            <Select
              labelId="size-label"
              label="표시 개수"
              value={String(query.size)}
              onChange={(e) =>
                setQuery((q) => ({ ...q, page: 0, size: Number(e.target.value) }))
              }
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}개
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {errorMsg && (
        <Typography color="error" variant="body2" sx={{ mb: 1 }}>
          {errorMsg}
        </Typography>
      )}

      {/* 표 */}
      <Paper elevation={1}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>신고 ID</TableCell>
              <TableCell>재난 유형</TableCell>
              <TableCell>위치</TableCell>
              <TableCell>접수 상태</TableCell>
              <TableCell>신고 시간</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.id}</TableCell>
                <TableCell>{DISASTER_TYPE_KO[row.disasterType] ?? row.disasterType}</TableCell>
                <TableCell>{`${row.province} ${row.city}`}</TableCell>
                <TableCell sx={{ color: getStatusColor(row.status), fontWeight: 600 }}>
                  {REPORT_STATUS_KO[row.status] ?? row.status}
                </TableCell>
                <TableCell>{new Date(row.createdAt).toLocaleString('ko-KR')}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    sx={{
                      textTransform: 'none',
                      borderColor: '#ff7c33',
                      color: '#ff7c33',
                      '&:hover': { borderColor: '#ff7c33', backgroundColor: '#fff5ec' },
                      '&:focus': { outline: 'none', boxShadow: 'none' },
                    }}
                    onClick={() => openModal(row)}
                  >
                    상세 보기
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  {query.province ? '데이터가 없습니다.' : '지역 정보를 불러오는 중…'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* 하단 페이지 컨트롤 */}
      <Stack direction="row" spacing={1.5} justifyContent="center" mt={2}>
        <Button
          variant="outlined"
          onClick={goPrev}
          disabled={loading || query.page === 0}
          sx={{ mr: 1 }}
        >
          이전
        </Button>
        <Button
          variant="contained"
          onClick={goNext}
          disabled={loading || !hasNext}
        >
          다음
        </Button>
      </Stack>

      {modalOpen && selected && (
        <DisasterDetailModal
          open
          onClose={closeModal}
          data={selected}
          onStatusChange={handleStatusChange}
        />
      )}
    </Box>
  );
}
