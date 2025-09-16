import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import type { PostStatus } from '../../../../types/volunteer';

type Props = {
  status: PostStatus;
  onChange?: (e: any) => void; // optional
  error?: boolean;
  helperText?: string;
  isCompleted?: boolean; // 봉사 완료 여부
};

export default function StatusSection({ status, onChange, error, helperText, isCompleted = false }: Props) {
  const readOnly = !onChange || isCompleted;

  return (
    <FormControl fullWidth error={error}>
      <InputLabel id="status-label">상태</InputLabel>
      <Select<PostStatus>
        labelId="status-label"
        label="상태"
        name="status"
        value={status}
        onChange={readOnly ? undefined : onChange} // 수정 불가 시 onChange 제거
        disabled={readOnly} // 선택 불가 처리
      >
        <MenuItem value="모집 중">모집 중</MenuItem>
        <MenuItem value="모집 마감">모집 마감</MenuItem>
        <MenuItem value="봉사 완료">봉사 완료</MenuItem>
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
