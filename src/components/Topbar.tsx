// src/components/Topbar.tsx
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

export default function Topbar() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        color: '#333',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Toolbar sx={{ px: 3, justifyContent: 'flex-end' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <AssignmentIndIcon sx={{ color: '#ff7c33' }} />
          <Typography variant="h6">
            서울시 재난 안전센터
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
