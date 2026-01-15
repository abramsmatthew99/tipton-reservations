import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Stack,
  TablePagination,
  Typography,
} from "@mui/material";
import BookingTable from "../../components/admin/BookingTable";
import type {
  RoomTypeSummary,
  UserSummary,
} from "../../components/admin/BookingTable";
import { cancelBooking, getBookings } from "../../apis/booking";
import { getRoomTypes } from "../../apis/roomtype";
import { getUsers } from "../../apis/users";
import type { BookingResponse } from "../../types/booking";

const AdminBookings = () => {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [users, setUsers] = useState<UserSummary[] | undefined>(undefined);
  const [roomTypes, setRoomTypes] = useState<RoomTypeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [bks, usrs, rts] = await Promise.all([
          getBookings(),
          getUsers(),
          getRoomTypes(),
        ]);
        if (!mounted) {
          return;
        }
        setBookings(Array.isArray(bks) ? bks : []);
        setUsers(Array.isArray(usrs) ? usrs : []);
        setRoomTypes(Array.isArray(rts) ? rts : []);
        setIsLoading(false);
      } catch (error) {
        if (mounted) {
          setErrorMessage("Failed to load bookings.");
          setIsLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

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

  const sortedBookings = useMemo(() => {
    return [...bookings].sort(
      (a, b) =>
        new Date(b.checkInDate).getTime() -
        new Date(a.checkInDate).getTime()
    );
  }, [bookings]);

  const pagedBookings = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedBookings.slice(start, start + rowsPerPage);
  }, [page, rowsPerPage, sortedBookings]);

  useEffect(() => {
    const maxPage = Math.max(
      0,
      Math.ceil(sortedBookings.length / rowsPerPage) - 1
    );
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, rowsPerPage, sortedBookings.length]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Bookings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View, inspect, and cancel reservations.
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : errorMessage ? (
          <Alert severity="error">{errorMessage}</Alert>
        ) : (
          <>
            <BookingTable
              bookings={pagedBookings}
              userNameById={userNameById}
              userById={userById}
              roomTypeById={roomTypeById}
              onCancelBooking={handleCancelBooking}
            />
            <TablePagination
              component="div"
              count={sortedBookings.length}
              page={page}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[rowsPerPage]}
            />
          </>
        )}
      </Stack>
    </Container>
  );
};

export default AdminBookings;
