import { useEffect, useMemo, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Menu, MenuItem,
  ListItemIcon, Divider,
} from '@mui/material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { getClaims } from '../auth/tokenStore';
import { logout } from '../api/auth';
import { getMyInfoCached } from '../api/user';

export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const orgFallback = useMemo(() => {
    const claims = getClaims();
    return (
      claims?.agencyName || claims?.orgName || claims?.centerName || '서울시 재난 안전센터'
    );
  }, []);

  const [nickname, setNickname] = useState('');

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const me = await getMyInfoCached();
        if (!ignore && me?.nickname) setNickname(me.nickname);
      } catch {/* 실패 시 fallback 사용 */}
    })();
    return () => { ignore = true; };
  }, []);

  const displayName = nickname || orgFallback;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/login', { replace: true, state: { from: location } });
  };

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: '#fff', color: '#333',
      zIndex: (t) => t.zIndex.drawer + 1, borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar sx={{ px: 3, justifyContent: 'flex-end', minHeight: 64 }}>
        <Button onClick={handleOpen}
          startIcon={<AssignmentIndIcon sx={{ color: '#ff7c33' }} />}
          endIcon={<KeyboardArrowDownIcon />}
          sx={{ textTransform: 'none', fontWeight: 700, color: 'text.primary' }}>
          <Typography variant="h6" component="span" sx={{ fontSize: 18 }}>
            {displayName}
          </Typography>
        </Button>

        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }} keepMounted>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
            로그아웃
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
