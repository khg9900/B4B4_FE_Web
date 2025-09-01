import { useEffect, useState, useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import Topbar from '../components/Topbar';
import VolunteerTable from '../components/VolunteerTable';
import VolunteerDetailModal from '../components/VolunteerDetailModal';
import VolunteerCreateModal from '../components/VolunteerCreateModal';

import { fetchMyPosts, fetchPostDetail, updateVolunteerPost } from '../api/volunteerPosts';
import { toListPostFromMy } from '../adapters/volunteer';
import type { ListPost, DetailPost, MyPostQuery, PostStatusEN, PostCategoryEN } from '../types/volunteer';

// UI(KO) → 서버(EN) 매핑 (검색용)
const STATUS_KO_TO_EN: Record<string, PostStatusEN> = {
  '모집 중': 'OPEN',
  '모집 마감': 'CLOSED',
  '봉사 완료': 'COMPLETED',
};
const CATEGORY_KO_TO_EN: Record<string, PostCategoryEN> = {
  '봉사활동 모집': 'RECRUITMENT',
  '구호물품 지원': 'SUPPORT',
};

export default function Post() {
  const [rows, setRows] = useState<ListPost[]>([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState<MyPostQuery>({ page: 0, size: 20 });

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<DetailPost | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await fetchMyPosts(query);
      setRows(page.content.map(toListPostFromMy));
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

  const handleSearch = useCallback((filters: {
    province?: string;
    city?: string;
    status?: string;       // KO
    category?: string;     // KO
    volunteerFrom?: string;
    volunteerTo?: string;
  }) => {
    const statusEN = filters.status ? STATUS_KO_TO_EN[filters.status] : undefined;
    const categoryEN = filters.category ? CATEGORY_KO_TO_EN[filters.category] : undefined;

    setQuery({
      ...query,
      page: 0,
      province: filters.province || undefined,
      city: filters.city || undefined,
      status: statusEN,
      category: categoryEN,
      volunteerStartDate: filters.volunteerFrom || undefined,
      volunteerEndDate: filters.volunteerTo || undefined,
    });
  }, [query]);

  const handleRowClick = useCallback(async (id: number) => {
    setDetailLoading(true);
    try {
      const d = await fetchPostDetail(id);
      setDetail({ ...d, id }); // ✅ 서버가 id를 안 줘도 경로 파라미터용으로 보장
      setDetailOpen(true);
    } catch (e) {
      console.error(e);
      alert('상세 조회 실패');
    } finally {
      setDetailLoading(false);
    }
  }, []);
    // 저장: PATCH → 목록 리프레시
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
    await updateVolunteerPost(next.id, next); // ✅ 변환은 API에서 수행
    await load();
  }, [load]);

  const handleCreated = useCallback(() => {
    setCreateOpen(false);
    void load();
  }, [load]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Topbar />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">봉사활동 게시글 관리</Typography>
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            + 게시글 등록
          </Button>
        </Box>

        <VolunteerTable
          rows={rows}
          onRowClick={handleRowClick}
          onSearch={handleSearch}
        />

        {loading && (
          <Typography sx={{ mt: 1, color: 'text.secondary' }}>
            로딩 중…
          </Typography>
        )}
      </Box>

      {detailOpen && detail && (
        <VolunteerDetailModal
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          data={detail}
          onSave={handleSaveDetail}
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
