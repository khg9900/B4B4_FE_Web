import React from 'react';
import { TextField } from '@mui/material';

type Props = {
  title: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function TitleSection({ title, onChange }: Props) {
  return (
    <TextField
      fullWidth
      label="제목"
      name="title"
      value={title}
      onChange={onChange}
      disabled={!onChange} // onChange가 없으면 읽기 전용
    />
  );
}

