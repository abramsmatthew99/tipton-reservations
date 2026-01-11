import { useEffect, useState } from 'react';
import { 
    Box, 
    Button, 
    Container, 
    Typography, 
    Grid, 
    AppBar, 
    Toolbar,
    CircularProgress 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CustomerRoomCard from '../components/CustomerRoomCard'; 
// @ts-ignore 
import { getRoomTypes } from '../apis/roomtype'; 
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [featuredRooms, setFeaturedRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await getRoomTypes();
                if (Array.isArray(data)) {
                    setFeaturedRooms(data.slice(0, 3)); 
                }
            } catch (error) {
                console.error("Failed to load rooms", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            

            {/* --- 2. HERO SECTION  */}
            <Box sx={{ 
                height: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://phgcdn.com/images/uploads/YVRHV/masthead/YVRHV-masthead-hotelvancouverexteriorday.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'common.white',
                px: 2
            }}>
                <Container maxWidth="md">
                    <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', textShadow: '2px 2px 10px rgba(0,0,0,0.5)', color: 'background.default' }}>
                        Experience Luxury
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 4, textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                        No B-Ball in the lobby
                    </Typography>
                    
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        size="large"
                        onClick={() => navigate(isAuthenticated ? '/customer' : '/login')}
                        sx={{ px: 5, py: 1.5, fontSize: '1.2rem', boxShadow: 4 }}
                    >
                        {isAuthenticated ? "Book a Room" : "Start Your Journey"}
                    </Button>
                </Container>
            </Box>

            {/* FEATURED ROOMS*/}
            <Container sx={{ py: 10 }}>
                <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 2, color: 'text.primary' }}>
                    Featured Accommodations
                </Typography>
                <Typography variant="h6" textAlign="center" sx={{ mb: 8, color: 'text.secondary', fontWeight: 'light' }}>
                    Curated spaces designed for your ultimate comfort.
                </Typography>
                
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress color="secondary" />
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {featuredRooms.map((room: any, index: number) => (
                            <Grid key={room.id || index} size={{ xs: 12, md: 4 }}>
                                <CustomerRoomCard 
                                    roomTypeId={room.id || "featured"}
                                    name={room.name || "Unknown Room"}
                                    basePrice={room.basePrice || 0}
                                    maxOccupancy={room.maxOccupancy || 2}
                                    description={room.description || "No description available."}
                                    amenities={room.amenities || []}
                                    imageUrls={
                                        Array.isArray(room.imageUrls) && room.imageUrls.length > 0
                                            ? room.imageUrls[0] 
                                            : undefined
                                    }
                                    onBookNow={() => navigate(isAuthenticated ? '/customer' : '/login')}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>            
        </Box>
    );
}