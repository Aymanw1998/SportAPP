import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: { fontSize: '2.2rem', fontWeight: 600 },
    h2: { fontSize: '1.8rem', fontWeight: 500 },
    body1: { fontSize: '1rem' },
  },
});

export default theme;
