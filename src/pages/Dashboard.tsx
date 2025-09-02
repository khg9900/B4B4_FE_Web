// src/pages/DashboardPage.tsx
import { Box, CssBaseline } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import DisasterTable from '../components/DisasterTable';

export default function DashboardPage() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <CssBaseline />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Topbar />
        <DisasterTable />
      </Box>
    </Box>
  );
}
