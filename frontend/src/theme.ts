import { createTheme } from '@mui/material/styles';

const colors = {
    olive: '#606C38',       
    blackForest: '#283618', 
    cornsilk: '#fefae0',    
    caramel: '#dda15e',     
    copper: '#bc6c25',     
};

export const theme = createTheme({
    palette: {
        primary: {
            main: colors.olive,
            contrastText: '#ffffff', 
        },
        secondary: {
            main: colors.copper,
            contrastText: '#ffffff',
        },
        background: {
            default: colors.cornsilk,
            paper: '#ffffff',         
        },
        text: {
            primary: colors.blackForest,
            secondary: colors.olive,
        },
    },
    typography: {
        fontFamily: '"Helvetica", "Arial", sans-serif',
        h1: { color: colors.blackForest },
        h2: { color: colors.blackForest },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8, 
                    textTransform: 'none', 
                },
            },
        },
    },
});