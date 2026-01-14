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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
} from "@mui/material";
import { getThisMonthsRevenue } from "../../apis/stripe";
import { cancelBooking, getBookings } from "../../apis/booking";
import { getRooms } from "../../apis/room";
import { getUsers } from "../../apis/users";
import { getRoomTypes } from "../../apis/roomtype";
import BasicModal from "../../components/Modal/BasicModal";

import type { BookingResponse, BookingStatus } from "../../types/booking";
import { countBookingsInProgress, formatDate } from "../../util/helper";

type UserSummary = {
  id: string | number;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
};

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
};

type RoomTypeSummary = {
  id?: string | number;
  name?: string;
  description?: string;
  maxOccupancy?: string | number;
  imageUrls?: string[];
};

const detailGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "160px 1fr" },
  columnGap: 2,
  rowGap: 1,
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
  const [users, setUsers] = useState<UserSummary[] | undefined>(undefined);
  const [totalRooms, setTotalRooms] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingResponse | null>(null);
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
  const selectedRoomType = selectedBooking
    ? roomTypeById.get(String(selectedBooking.roomTypeId))
    : undefined;
  const selectedUser = selectedBooking
    ? userById.get(String(selectedBooking.userId))
    : undefined;

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

  const handleOpenViewModal = (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedBooking(null);
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

          <TableContainer
            component={Paper}
            elevation={1}
            sx={{ overflowX: "auto" }}
          >
            <Table
              sx={{
                minWidth: 1200,
                "& td, & th": {
                  whiteSpace: "nowrap",
                  px: 2,
                },
                "& td:nth-of-type(2), & td:nth-of-type(3)": {
                  whiteSpace: "normal",
                  overflowWrap: "break-word",
                  minWidth: 150,
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Confirmation #</TableCell>
                  <TableCell>Guest</TableCell>
                  <TableCell>Room Type</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Check-in</TableCell>
                  <TableCell>Check-out</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Typography variant="body2" color="text.secondary">
                        No bookings found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking.id} hover>
                      <TableCell>{booking.confirmationNumber}</TableCell>
                      <TableCell sx={{ overflowWrap: "anywhere" }}>
                        {userNameById.get(String(booking.userId)) || "Unknown"}
                      </TableCell>
                      <TableCell sx={{ overflowWrap: "anywhere" }}>
                        {booking.roomTypeName}
                      </TableCell>
                      <TableCell>{booking.roomNumber}</TableCell>
                      <TableCell>{formatDate(booking.checkInDate)}</TableCell>
                      <TableCell>{formatDate(booking.checkOutDate)}</TableCell>
                      <TableCell>{getStatusChip(booking.status)}</TableCell>
                      <TableCell align="right">
                        ${Number(booking.totalPrice).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{ minWidth: 0, px: 1.25 }}
                            onClick={() => handleOpenViewModal(booking)}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            sx={{ minWidth: 0, px: 1.25 }}
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <BasicModal
            open={isViewModalOpen}
            onClose={handleCloseViewModal}
            title="Booking details"
          >
            {selectedBooking ? (
              <Stack spacing={2} id="basic-modal-description">
                <Box
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                    bgcolor: "grey.50",
                  }}
                >
                  <Typography variant="overline" color="text.secondary">
                    Booking
                  </Typography>
                  <Box sx={detailGridSx}>
                    <Typography variant="caption" color="text.secondary">
                      Confirmation
                    </Typography>
                    <Typography variant="body2">
                      {selectedBooking.confirmationNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body2">
                      {selectedBooking.status}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Check-in
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(selectedBooking.checkInDate)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Check-out
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(selectedBooking.checkOutDate)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total
                    </Typography>
                    <Typography variant="body2">
                      ${Number(selectedBooking.totalPrice).toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Room number
                    </Typography>
                    <Typography variant="body2">
                      {selectedBooking.roomNumber}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Typography variant="overline" color="text.secondary">
                    Guest
                  </Typography>
                  <Box sx={detailGridSx}>
                    <Typography variant="caption" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body2">
                      {selectedUser
                        ? `${selectedUser.firstName ?? ""} ${
                            selectedUser.lastName ?? ""
                          }`.trim() || "-"
                        : "-"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body2">
                      {selectedUser?.phoneNumber ?? "-"}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Typography variant="overline" color="text.secondary">
                    Room Type
                  </Typography>
                  <Box sx={detailGridSx}>
                    <Typography variant="caption" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body2">
                      {selectedRoomType?.name ?? "-"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body2">
                      {selectedRoomType?.description ?? "-"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Max occupancy
                    </Typography>
                    <Typography variant="body2">
                      {selectedRoomType?.maxOccupancy ?? "-"}
                    </Typography>
                  </Box>
                  {selectedRoomType?.imageUrls?.[0] ? (
                    <Box
                      component="img"
                      src={selectedRoomType.imageUrls[0]}
                      alt={selectedRoomType.name ?? "Room type"}
                      sx={{
                        mt: 2,
                        width: "100%",
                        maxHeight: 220,
                        objectFit: "cover",
                        borderRadius: 2,
                        border: 1,
                        borderColor: "divider",
                      }}
                    />
                  ) : null}
                </Box>
              </Stack>
            ) : (
              <Typography id="basic-modal-description" variant="body2">
                No booking selected.
              </Typography>
            )}
          </BasicModal>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
