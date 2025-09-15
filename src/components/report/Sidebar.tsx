// src/components/Sidebar.tsx
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import PlaceIcon from '@mui/icons-material/Place';
import { NavLink } from 'react-router-dom';
import LogoImage from '../../assets/logo.png';

const menuItems = [
  { text: '홈',       icon: <HomeIcon />,            path: '/home' },
  { text: '신고 목록', icon: <SpaceDashboardIcon />, path: '/dashboard' },
  { text: '지도 보기', icon: <PlaceIcon />,          path: '/map' },
];

export default function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 300,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 300,
          backgroundColor: '#ff7c33',
          color: '#fff',
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <img src={LogoImage} alt="로고" style={{ height: 110 }} />
      </Box>

      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={NavLink}
            to={item.path}
            end={item.path === '/dashboard'}
            sx={{
              borderRadius: 1,
              textDecoration: 'none',
              color: '#fff',
              '& .MuiListItemIcon-root': { color: '#fff', minWidth: 36 },
              '& .MuiListItemText-primary': { color: '#fff' },

              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                '& .MuiListItemText-primary': { color: '#fff' },
                '& .MuiListItemIcon-root': { color: '#fff' },
              },

              '&.active': {
                backgroundColor: 'rgba(255,255,255,0.20)',
                fontWeight: 700,
                boxShadow: 'inset 4px 0 0 0 #fff',
                color: '#fff',
                '& .MuiListItemText-primary': { color: '#fff' },
                '& .MuiListItemIcon-root': { color: '#fff' },
              },

              // 링크 상태 전부 흰색 고정
              '&:link, &:visited, &:active, &:focus': { color: '#fff' },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{ sx: { color: '#fff' } }}
            />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
