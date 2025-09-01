import AppDialog from './AppDialog';
import VolunteerForm from './VolunteerForm';
import { createVolunteerPost as realCreate } from '../api/volunteerPosts';
import type { CreatePostRequest } from '../types/volunteer';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (created: any) => void;
  /** 테스트나 목 API 주입용. 생략 시 실제 API 사용 */
  createApi?: (payload: CreatePostRequest) => Promise<any>;
};

export default function VolunteerCreateModal({
  open, onClose, onCreated, createApi,
}: Props) {
  const runCreate = createApi ?? realCreate;

  return (
    <AppDialog open={open} onClose={onClose} title="새 게시글 등록" maxWidth="md">
      <VolunteerForm
        framed={false}
        showButtons={true}
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
