import { useState, useMemo } from "react";
import {
  Container,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Tabs,
  Tab,
  Box,
  Button,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import BookingCard from "../../components/Booking/BookingCard";
import { useGetUserBookingsQuery } from "../../store/api/bookingApi";
import { isBefore, parseISO, isAfter } from "date-fns";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HistoryIcon from '@mui/icons-material/History';
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

// Types
import type { BookingResponse } from "../../types/booking";

function BookingsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useGetUserBookingsQuery({});
  const [tabIndex, setTabIndex] = useState(0);

  const bookings = (data?.content || []) as BookingResponse[];

  // --- FILTER LOGIC ---
  const { upcoming, past, cancelled } = useMemo(() => {
    const today = new Date();
    const up: BookingResponse[] = [];
    const pa: BookingResponse[] = [];
    const ca: BookingResponse[] = [];

    bookings.forEach((b) => {
      // Hide VOIDED bookings (failed/abandoned payment attempts)
      if (b.status === "VOIDED") {
        return;
      }

      if (b.status === "CANCELLED") {
        ca.push(b);
        return;
      }

      const checkOut = parseISO(b.checkOutDate);

      if (b.status === "COMPLETED" || !isAfter(checkOut, today)) {
        pa.push(b);
      } else {
        up.push(b);
      }
    });

    up.sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime());
    pa.sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime());
    ca.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { upcoming: up, past: pa, cancelled: ca };
  }, [bookings]);

  const currentList = tabIndex === 0 ? upcoming : tabIndex === 1 ? past : cancelled;

  // --- RENDER HELPERS ---
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
          Retrieving your reservations...
        </Typography>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
            Failed to load bookings. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* HEADER */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
                My Bookings
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Manage your upcoming stays and view history.
            </Typography>
        </Box>
        <Button 
            variant="contained" 
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/customer')}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
            Book New Stay
        </Button>
      </Box>

      {/* TABS */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="booking tabs">
          <Tab icon={<EventAvailableIcon />} iconPosition="start" label={`Upcoming (${upcoming.length})`} />
          <Tab icon={<HistoryIcon />} iconPosition="start" label={`Past (${past.length})`} />
          <Tab icon={<CancelScheduleSendIcon />} iconPosition="start" label={`Cancelled (${cancelled.length})`} />
        </Tabs>
      </Box>

      {/* CONTENT */}
      {currentList.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
                No {tabIndex === 0 ? "upcoming" : tabIndex === 1 ? "past" : "cancelled"} bookings found.
            </Typography>
            {tabIndex === 0 && (
                <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/customer')}>
                    Find a Room
                </Button>
            )}
        </Box>
      ) : (
        <Stack spacing={3}>
          {currentList.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </Stack>
      )}
    </Container>
  );
}

export default BookingsPage;