import AppDialog from './AppDialog';
import VolunteerForm from './VolunteerForm';
import type { VolunteerPostCreateReq } from '../types/volunteer';
import { createVolunteerPost as realCreate } from '../api/volunteerPosts';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (created: any) => void;
  createApi?: (payload: VolunteerPostCreateReq) => Promise<any>; // 목/실서버 주입
};

export default function VolunteerCreateModal({
  open, onClose, onCreated, createApi,
}: Props) {
  const runCreate = createApi ?? realCreate;

  return (
    <AppDialog open={open} onClose={onClose} title="새 게시글 등록" maxWidth="md">
      <VolunteerForm
        framed={false}          // ← 카드/내부 헤더 제거
        showButtons={true}      // ← 모달 하단 버튼은 폼 내부에서 처리
        createApi={runCreate}
        submitLabel="등록"
        onCancel={onClose}
        onSubmitSuccess={(created) => {
          onCreated?.(created);
          onClose();
        }}
      />
    </AppDialog>
  );
}
