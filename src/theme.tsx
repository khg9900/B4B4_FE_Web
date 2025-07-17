// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff7c33',
      contrastText: '#fff',
    },
    secondary: {
      main: '#f5a623',
    },
  },
});

export default theme;