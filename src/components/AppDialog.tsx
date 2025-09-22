import type { ReactNode } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

export default function AppDialog({
  open, onClose, title, children, actions, maxWidth = 'md',
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          mt: { xs: 2, sm: 4 },
          mb: { xs: 2, sm: 4 },
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: '#ff7c33',
          color: '#fff',
          fontWeight: 700,
          px: 3,
          py: 2,
          pr: 6,
        }}
      >
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: '#fff' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ pt: 3, px: 3, pb: 3 }}>
          {children}
        </Box>
      </DialogContent>

      {actions && (
        <DialogActions sx={{ px: 3, py: 2 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
