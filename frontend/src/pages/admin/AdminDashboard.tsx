import { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { getThisMonthsRevenue } from "../../apis/stripe";
import { cancelBooking, getBookings } from "../../apis/booking";
import { getRooms } from "../../apis/room";
import { getUsers } from "../../apis/users";
import { getRoomTypes } from "../../apis/roomtype";
import BookingTable, {
  RoomTypeSummary,
  UserSummary,
} from "../../components/admin/BookingTable";

import type { BookingResponse } from "../../types/booking";
import { countBookingsInProgress } from "../../util/helper";

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

const formatRevenue = (value: string | number) => {
  const normalized = typeof value === "number" ? value.toFixed(2) : value;
  return `$${normalized}`;
};
const AdminDashboard = () => {
  const [monthRevenue, setMonthRevenue] = useState<string>("0.00");
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [users, setUsers] = useState<UserSummary[] | undefined>(undefined);
  const [totalRooms, setTotalRooms] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomTypeSummary[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const [revenueData, bookingsData, roomsData, userData, roomTypesData] =
          await Promise.all([
            getThisMonthsRevenue(),
            getBookings(),
            getRooms(),
            getUsers(),
            getRoomTypes(),
          ]);
        console.log(userData);

        if (!isMounted) {
          return;
        }
        const normalizedBookings = Array.isArray(bookingsData)
          ? bookingsData
          : bookingsData?.content ?? [];
        const normalizedRooms = Array.isArray(roomsData)
          ? roomsData
          : roomsData?.content ?? [];
        const normalizedRoomTypes = Array.isArray(roomTypesData)
          ? roomTypesData
          : roomTypesData?.content ?? [];

        setMonthRevenue(String(revenueData));
        setBookings(normalizedBookings);
        setUsers(userData);
        setTotalRooms(normalizedRooms.length);
        setRoomTypes(normalizedRoomTypes);
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
  const userNameById = new Map(
    (Array.isArray(users) ? users : []).map((user) => [
      String(user.id),
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
    ])
  );
  const userById = new Map(
    (Array.isArray(users) ? users : []).map((user) => [String(user.id), user])
  );
  const roomTypeById = new Map(
    roomTypes.map((roomType) => [String(roomType.id), roomType])
  );
  const inProgressBookings = countBookingsInProgress(bookings);
  const occupancyRate =
    totalRooms > 0
      ? `${((inProgressBookings / totalRooms) * 100).toFixed(1)}%`
      : "0.0%";

  const revenueLabel = formatRevenue(monthRevenue);
  const handleCancelBooking = async (bookingId?: string) => {
    if (!bookingId) {
      return;
    }
    const confirmed = window.confirm(
      "Cancel this booking? This action cannot be undone."
    );
    if (!confirmed) {
      return;
    }
    try {
      await cancelBooking(bookingId);
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ pb: 4 }}>
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

          <BookingTable
            bookings={bookings}
            userNameById={userNameById}
            userById={userById}
            roomTypeById={roomTypeById}
            onCancelBooking={handleCancelBooking}
          />
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
