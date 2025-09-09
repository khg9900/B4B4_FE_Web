import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import type { PostStatus } from '../../../types/volunteer';

type Props = {
  status: PostStatus;
  onChange: (e: any) => void;
  error?: boolean;
  helperText?: string;
};

export default function StatusSection({ status, onChange, error, helperText }: Props) {
  return (
    <FormControl fullWidth error={error}>
      <InputLabel id="status-label">상태</InputLabel>
      <Select<PostStatus>
        labelId="status-label"
        label="상태"
        name="status"
        value={status}
        onChange={onChange}
      >
        <MenuItem value="모집 중">모집 중</MenuItem>
        <MenuItem value="모집 마감">모집 마감</MenuItem>
        <MenuItem value="봉사 완료">봉사 완료</MenuItem>
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
