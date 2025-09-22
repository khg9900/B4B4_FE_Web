import React from 'react';
import { TextField } from '@mui/material';

type Props = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  errors?: { content?: string };
};

export default function ContentSection({ content, setContent, errors }: Props) {
  return (
    <TextField
      fullWidth
      multiline
      minRows={3}
      label="내용"
      value={content}
      onChange={(e) => setContent(e.target.value)}
      placeholder="봉사 내용, 준비물, 유의사항 등을 입력하세요."
      error={!!errors?.content}
      helperText={errors?.content}
    />
  );
}

