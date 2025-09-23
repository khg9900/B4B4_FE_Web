import React from 'react';
import { Stack, TextField, FormControl, InputLabel, Select, MenuItem, } from '@mui/material';
import type { PostCategory } from '../../../../types/volunteer';

type Props = {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  category: PostCategory;
  setCategory: React.Dispatch<React.SetStateAction<PostCategory>>;
  errors?: { title?: string };
};

const POST_CATEGORIES: PostCategory[] = ['봉사활동 모집', '구호물품 지원'];

export default function TitleCategorySection({ title, setTitle, category, setCategory, errors }: Props) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <TextField
        fullWidth
        label="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={!!errors?.title}
        helperText={errors?.title}
      />
      <FormControl fullWidth>
        <InputLabel id="cat-label">카테고리</InputLabel>
        <Select
          labelId="cat-label"
          label="카테고리"
          value={category}
          onChange={(e) => setCategory(e.target.value as PostCategory)}
        >
          {POST_CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
