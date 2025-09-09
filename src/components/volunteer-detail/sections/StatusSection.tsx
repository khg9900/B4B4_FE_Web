import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { PostStatus } from '../../../types/volunteer';

type Props = {
  status: PostStatus;
  onChange: (e: any) => void;
};

export default function StatusSection({ status, onChange }: Props) {
  return (
    <FormControl fullWidth>
      <InputLabel id="status-label">상태</InputLabel>
      <Select<PostStatus> labelId="status-label" label="상태" name="status" value={status} onChange={onChange}>
        <MenuItem value="모집 중">모집 중</MenuItem>
        <MenuItem value="모집 마감">모집 마감</MenuItem>
        <MenuItem value="봉사 완료">봉사 완료</MenuItem>
      </Select>
    </FormControl>
  );
}
