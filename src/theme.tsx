import { createTheme } from '@mui/material/styles';

const ORANGE_MAIN = '#ff7c33';
const ORANGE_HOVER = '#ff6a14';

const theme = createTheme({
  palette: {
    primary: {
      main: ORANGE_MAIN,
      dark: ORANGE_HOVER,
      contrastText: '#fff',
    },
    secondary: { main: '#f5a623' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          '&:focus, &.Mui-focusVisible': { outline: 'none', boxShadow: 'none' },
        },

        containedPrimary: {
          backgroundColor: ORANGE_MAIN,
          boxShadow: 'none',
          '&:hover':   { backgroundColor: ORANGE_HOVER, boxShadow: 'none' },
          '&:active':  { backgroundColor: ORANGE_HOVER, boxShadow: 'none' },
        },

        outlinedPrimary: {
          color: ORANGE_MAIN,
          borderColor: ORANGE_MAIN,
          boxShadow: 'none',
          '&:hover':  { borderColor: ORANGE_HOVER, backgroundColor: 'transparent', boxShadow: 'none' },
          '&:active': { borderColor: ORANGE_HOVER, boxShadow: 'none' },
          '&:focus, &.Mui-focusVisible': { outline: 'none', boxShadow: 'none' },
        },
      },
    },

    MuiToggleButtonGroup: {
      styleOverrides: { root: { columnGap: 10 } },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          borderRadius: 999,
          paddingInline: 14,
          paddingBlock: 6,
          border: '1px solid',
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary,
          backgroundColor: '#fff',
          boxShadow: 'none',
          '&:hover': { backgroundColor: '#fff', borderColor: theme.palette.divider, boxShadow: 'none' },
          '&:focus, &.Mui-focusVisible': { outline: 'none', boxShadow: 'none' },
          '&.Mui-selected, &.Mui-selected:hover': {
            color: ORANGE_MAIN,
            borderColor: ORANGE_MAIN,
            backgroundColor: '#fff',
            boxShadow: 'none',
          },
        }),
        sizeSmall: { paddingInline: 12, paddingBlock: 4, fontSize: 13 },
      },
    },
  },
});

export default theme;
