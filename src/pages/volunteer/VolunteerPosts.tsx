import { useEffect, useState, useCallback } from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import Topbar from '../../components/Topbar';
import VolunteerTable from '../../components/volunteer/VolunteerTable';
import VolunteerDetailModal from '../../components/volunteer/volunteer-detail/VolunteerDetailModal';
import VolunteerCreateModal from '../../components/volunteer/volunteer-create/VolunteerCreateModal';
import {fetchMyPosts, fetchPostDetail, updateVolunteerPost, deleteVolunteerPost, } from '../../api/volunteerPosts';
import type { ListPost, DetailPost, MyPostQuery, PostStatusEN, PostCategoryEN } from '../../types/volunteer';

const STATUS_KO_TO_EN: Record<'모집 중' | '모집 마감' | '봉사 완료', PostStatusEN> = {
  '모집 중': 'OPEN',
  '모집 마감': 'CLOSED',
  '봉사 완료': 'COMPLETED',
};

const CATEGORY_KO_TO_EN: Record<'봉사활동 모집' | '구호물품 지원', PostCategoryEN> = {
  '봉사활동 모집': 'RECRUITMENT',
  '구호물품 지원': 'SUPPORT',
};

const toStatusEN = (ko?: string): PostStatusEN | undefined =>
  ko ? STATUS_KO_TO_EN[ko as keyof typeof STATUS_KO_TO_EN] : undefined;

const toCategoryEN = (ko?: string): PostCategoryEN | undefined =>
  ko ? CATEGORY_KO_TO_EN[ko as keyof typeof CATEGORY_KO_TO_EN] : undefined;

export default function Post() {
  const [rows, setRows] = useState<ListPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<MyPostQuery>({ page: 0, size: 10 });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [hasNext, setHasNext] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<DetailPost | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const slice = await fetchMyPosts(query);
      setRows(slice.content);
      setPage(slice.page);
      setSize(slice.size);
      setHasNext(slice.hasNext);
    } catch (e) {
      console.error(e);
      alert('목록 조회 실패');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (loading) return;
    const pane = document.getElementById('page-scroll');
    pane?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, loading]);

  const handleSearch = useCallback((filters: {
    province?: string;
    city?: string;
    status?: string;
    category?: string;
    volunteerFrom?: string;
    volunteerTo?: string;
  }) => {
    const next: MyPostQuery = {
      page: 0,
      size: query.size ?? size,
      province: filters.province || undefined,
      city: filters.city || undefined,
      status: toStatusEN(filters.status),        
      category: toCategoryEN(filters.category),  
      volunteerStartDate: filters.volunteerFrom || undefined,
      volunteerEndDate: filters.volunteerTo || undefined,
    };

    setQuery(next);
  }, [query.size, size]);

  const handleRowClick = useCallback(async (id: number) => {
    setDetailLoading(true);
    try {
      const d = await fetchPostDetail(id);
      setDetail({ ...d, id });
      setDetailOpen(true);
    } catch (e) {
      console.error(e);
      alert('상세 조회 실패');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleSaveDetail = useCallback(async (next: DetailPost) => {
    if (next.id == null) {
      alert('게시글 ID가 없습니다.');
      return;
    }
    if (next.attendanceStartTime && next.attendanceEndTime) {
      if (next.attendanceStartTime >= next.attendanceEndTime) {
        alert('출석 시작 시간은 종료 시간보다 빨라야 합니다.');
        return;
      }
    }

    await updateVolunteerPost(next.id, next);
    await load();
  }, [load]);

  const handleDeleteDetail = useCallback(async (id: number) => {
    await deleteVolunteerPost(id);
    await load();
    setDetailOpen(false);
  }, [load]);

  const handleCreated = useCallback(() => {
    setCreateOpen(false);
    void load();
  }, [load]);

  const goPrev = () => setQuery(q => ({ ...q, page: Math.max(0, (q.page ?? 0) - 1) }));
  const goNext = () => { if (hasNext) setQuery(q => ({ ...q, page: (q.page ?? 0) + 1 })); };

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize);
    setQuery(q => ({ ...q, page: 0, size: newSize }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Topbar />
      <Box id="page-scroll" sx={{ flexGrow: 1, p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5">봉사활동 게시글 관리</Typography>
          <Button variant="contained" onClick={() => setCreateOpen(true)}>+ 게시글 등록</Button>
        </Stack>

        <VolunteerTable
          rows={rows}
          onRowClick={handleRowClick}
          onSearch={handleSearch}
          page={page}
          size={size}
          onSizeChange={handlePageSizeChange}
        />

        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={goPrev} disabled={loading || page === 0} sx={{ mr: 1 }}>
            이전
          </Button>
          <Button variant="contained" onClick={goNext} disabled={loading || !hasNext}>
            다음
          </Button>
        </Stack>
      </Box>

      {detailOpen && detail && (
        <VolunteerDetailModal
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          data={detail}
          onSave={handleSaveDetail}
          onDelete={handleDeleteDetail}
        />
      )}

      {detailLoading && (
        <Typography sx={{ position: 'fixed', bottom: 16, right: 16 }}>
          상세 로딩…
        </Typography>
      )}

      {createOpen && (
        <VolunteerCreateModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </Box>
  );
}
