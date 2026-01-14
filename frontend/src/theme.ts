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
        // 1. Set the global default font to Inter (Body, Buttons, Inputs)
        fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
        
        // 2. Override Headings to use Playfair Display
        h1: { 
            fontFamily: '"Playfair Display", serif', 
            color: colors.blackForest,
            fontWeight: 700 
        },
        h2: { 
            fontFamily: '"Playfair Display", serif', 
            color: colors.blackForest, 
            fontWeight: 600
        },
        h3: { 
            fontFamily: '"Playfair Display", serif', 
            color: colors.blackForest, 
            fontWeight: 600
        },
        h4: { 
            fontFamily: '"Playfair Display", serif', 
            color: colors.blackForest, 
            fontWeight: 500
        },
        h5: { 
            fontFamily: '"Playfair Display", serif', 
            color: colors.blackForest, 
            fontWeight: 500
        },
        h6: { 
            fontFamily: '"Playfair Display", serif', 
            color: colors.blackForest, 
            fontWeight: 500
        },
        // Optional: Make the brand name/logo text strictly Playfair
        button: {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 600,
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8, 
                    textTransform: 'none', 
                    // Buttons will automatically inherit 'Inter' from typography.button
                },
            },
        },
    },
});