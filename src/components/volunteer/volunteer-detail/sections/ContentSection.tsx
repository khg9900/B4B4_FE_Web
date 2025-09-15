import React from 'react';
import { TextField } from '@mui/material';

type Props = {
  content?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function ContentSection({ content, onChange }: Props) {
  return (
    <TextField
      fullWidth
      multiline
      minRows={3}
      label="세부사항"
      name="content"
      value={content ?? ''}
      onChange={onChange}
      placeholder="봉사 내용, 준비물, 유의사항 등을 입력하세요."
    />
  );
}
