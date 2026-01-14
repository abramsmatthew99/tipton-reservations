import { Box, Container, Grid, Typography, Stack} from '@mui/material';

export default function Footer() {
    return (
        <Box component="footer" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 3, mt: 5 }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid size={{xs:12, md:4}}>
                        <Typography variant="h6" gutterBottom>The Tipton</Typography>
                        <Typography variant="body2">
                            123 Forest Lane<br />
                            Woodland, CA 90210
                        </Typography>
                    </Grid>
                    <Grid size={{xs:12, md:4}}>
                        <Typography variant="h6" gutterBottom>Contact</Typography>
                        <Typography variant="body2">
                            (555) 123-4567<br />
                            reservations@tipton.com
                        </Typography>
                    </Grid>
                    <Grid size={{xs:12, md:4}}>
                        <Typography variant="h6" gutterBottom>Follow Us</Typography>
                        <Stack direction="row" spacing={2}>
                            <Typography variant="body2" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>Instagram</Typography>
                            <Typography variant="body2" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>Facebook</Typography>
                        </Stack>
                    </Grid>
                </Grid>
                <Typography variant="body2" textAlign="center" sx={{ mt: 4, opacity: 0.7 }}>
                    © 2026 Tipton Hotel Group. All rights reserved.
                </Typography>
            </Container>
        </Box>
    );
}