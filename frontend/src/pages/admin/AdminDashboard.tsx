import { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { getThisMonthsRevenue } from "../../apis/stripe";
import { getBookings } from "../../apis/booking";
import { getRooms } from "../../apis/room";
import type { BookingResponse, BookingStatus } from "../../types/booking";
import { countBookingsInProgress, formatDate } from "../../util/helper";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
};

const StatCard = ({ label, value, helper }: StatCardProps) => (
  <Card elevation={1}>
    <CardContent>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={700}>
        {value}
      </Typography>
      {helper ? (
        <Typography variant="body2" color="text.secondary">
          {helper}
        </Typography>
      ) : null}
    </CardContent>
  </Card>
);

const getStatusChip = (status: BookingStatus) => {
  const statusConfig = {
    CONFIRMED: { color: "success" as const, label: "Confirmed" },
    PENDING: { color: "warning" as const, label: "Pending" },
    CANCELLED: { color: "error" as const, label: "Cancelled" },
    COMPLETED: { color: "info" as const, label: "Completed" },
    VOIDED: { color: "default" as const, label: "Voided" },
  };

  const config = statusConfig[status];
  return <Chip label={config.label} color={config.color} size="small" />;
};

const formatRevenue = (value: string | number) => {
  const normalized = typeof value === "number" ? value.toFixed(2) : value;
  return `$${normalized}`;
};

const AdminDashboard = () => {
  const [monthRevenue, setMonthRevenue] = useState<string>("0.00");
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const [revenueData, bookingsData, roomsData] = await Promise.all([
          getThisMonthsRevenue(),
          getBookings(),
          getRooms(),
        ]);

        if (!isMounted) {
          return;
        }

        const normalizedBookings = Array.isArray(bookingsData)
          ? bookingsData
          : bookingsData?.content ?? [];

        const normalizedRooms = Array.isArray(roomsData)
          ? roomsData
          : roomsData?.content ?? [];

        setMonthRevenue(String(revenueData));
        setBookings(normalizedBookings);
        console.log(normalizedBookings);
        setTotalRooms(normalizedRooms.length);
      } catch (error) {
        setErrorMessage("Unable to load dashboard data. Please try again.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "CONFIRMED"
  );
  const inProgressBookings = countBookingsInProgress(bookings);
  const occupancyRate =
    totalRooms > 0
      ? `${((inProgressBookings / totalRooms) * 100).toFixed(1)}%`
      : "0.0%";

  const revenueLabel = formatRevenue(monthRevenue);

  return (
    <Container maxWidth="xl" sx={{ pb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Dashboard Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track revenue, occupancy, and recent booking activity.
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : errorMessage ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                label="Monthly Revenue"
                value={revenueLabel}
                helper="This month"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                label="Active Bookings"
                value={String(confirmedBookings.length)}
                helper='Status: "CONFIRMED"'
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                label="Total Bookings"
                value={String(bookings.length)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard label="Total Rooms" value={String(totalRooms)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                label="Occupancy Rate"
                value={occupancyRate}
                helper={`${inProgressBookings} in progress`}
              />
            </Grid>
          </Grid>

          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Confirmation #</TableCell>
                  <TableCell>Room Type</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Check-in</TableCell>
                  <TableCell>Check-out</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="body2" color="text.secondary">
                        No bookings found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>{booking.confirmationNumber}</TableCell>
                      <TableCell>{booking.roomTypeName}</TableCell>
                      <TableCell>{booking.roomNumber}</TableCell>
                      <TableCell>{formatDate(booking.checkInDate)}</TableCell>
                      <TableCell>{formatDate(booking.checkOutDate)}</TableCell>
                      <TableCell>{getStatusChip(booking.status)}</TableCell>
                      <TableCell align="right">
                        ${Number(booking.totalPrice).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
