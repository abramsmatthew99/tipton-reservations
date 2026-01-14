import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import BasicModal from "../Modal/BasicModal";
import type { BookingResponse, BookingStatus } from "../../types/booking";
import { formatDate } from "../../util/helper";

export type UserSummary = {
  id: string | number;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
};

export type RoomTypeSummary = {
  id?: string | number;
  name?: string;
  description?: string;
  maxOccupancy?: string | number;
  imageUrls?: string[];
};

type BookingTableProps = {
  bookings: BookingResponse[];
  userNameById: Map<string, string>;
  userById: Map<string, UserSummary>;
  roomTypeById: Map<string, RoomTypeSummary>;
  onCancelBooking: (bookingId?: string) => void;
};

const detailGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "160px 1fr" },
  columnGap: 2,
  rowGap: 1,
};

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

const BookingTable = ({
  bookings,
  userNameById,
  userById,
  roomTypeById,
  onCancelBooking,
}: BookingTableProps) => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<BookingResponse | null>(null);

  const selectedRoomType = selectedBooking
    ? roomTypeById.get(String(selectedBooking.roomTypeId))
    : undefined;
  const selectedUser = selectedBooking
    ? userById.get(String(selectedBooking.userId))
    : undefined;

  const handleOpenViewModal = (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedBooking(null);
  };

  return (
    <>
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
                        onClick={() => onCancelBooking(booking.id)}
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
  );
};

export default BookingTable;
