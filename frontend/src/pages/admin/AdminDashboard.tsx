import { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isSameDay } from "date-fns";

// Icons
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";

// APIs & Types
import { getThisMonthsRevenue } from "../../apis/stripe";
import { cancelBooking, getBookings } from "../../apis/booking";
import { getRooms } from "../../apis/room";
import { getUsers } from "../../apis/users";
import { getRoomTypes } from "../../apis/roomtype";

import type { BookingResponse } from "../../types/booking";
import { countBookingsInProgress } from "../../util/helper";

// --- Sub-Components ---

/**
 * Reusable card for displaying high-level metrics (Revenue, Occupancy, etc.).
 */
const StatCard = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) => {
  const theme = useTheme();
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <CardContent>
        <Stack spacing={1}>
          <Typography
            variant="overline"
            color="text.secondary"
            fontWeight={700}
            letterSpacing={1.1}
          >
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={800} color="text.primary">
            {value}
          </Typography>
          {helper && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              {helper}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

/**
 * Maps booking status enums to UI-friendly colors and labels.
 */
const StatusChip = ({ status }: { status: BookingStatus }) => {
  const config = {
    CONFIRMED: { color: "success" as const, label: "Confirmed" },
    PENDING: { color: "warning" as const, label: "Pending" },
    CANCELLED: { color: "error" as const, label: "Cancelled" },
    COMPLETED: { color: "info" as const, label: "Completed" },
    VOIDED: { color: "default" as const, label: "Voided" },
  }[status];

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      variant="soft"
      sx={{ fontWeight: 600, borderRadius: 1 }}
    />
  );
};

/**
 * Widget displaying daily operational lists (Arrivals and Departures).
 * Filters the master booking list for events matching the current date.
 */
const DailyActivityWidget = ({ bookings }: { bookings: BookingResponse[] }) => {
  const [tab, setTab] = useState(0);
  const theme = useTheme();
  const today = new Date();

  // Filter logic: Arrivals (Check-in matches today) vs Departures (Check-out matches today)
  const arrivals = bookings.filter(
    (b) => isSameDay(parseISO(b.checkInDate), today) && b.status === "CONFIRMED"
  );
  const departures = bookings.filter(
    (b) =>
      isSameDay(parseISO(b.checkOutDate), today) &&
      (b.status === "CONFIRMED" || b.status === "COMPLETED")
  );

  const listData = tab === 0 ? arrivals : departures;
  const emptyMessage =
    tab === 0
      ? "No arrivals scheduled for today."
      : "No departures scheduled for today.";

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        height: "100%",
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
          <Tab
            icon={<LoginIcon fontSize="small" />}
            iconPosition="start"
            label="Arrivals"
          />
          <Tab
            icon={<LogoutIcon fontSize="small" />}
            iconPosition="start"
            label="Departures"
          />
        </Tabs>
      </Box>
      <Box sx={{ maxHeight: 350, overflow: "auto" }}>
        {listData.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {emptyMessage}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {listData.map((b, i) => (
              <div key={b.id}>
                {i > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={600}>
                        {b.roomTypeName}{" "}
                        {b.roomNumber ? `(#${b.roomNumber})` : "(Unassigned)"}
                      </Typography>
                    }
                    secondary={
                      b.guestFirstName && b.guestLastName
                        ? `${b.guestFirstName} ${b.guestLastName}`
                        : `Conf: ${b.confirmationNumber}`
                    }
                  />
                  <StatusChip status={b.status} />
                </ListItem>
              </div>
            ))}
          </List>
        )}
      </Box>
    </Card>
  );
};

// --- Helpers ---
const formatRevenue = (val: string | number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(val)
  );

// --- Main View ---

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Dashboard State
  const [monthRevenue, setMonthRevenue] = useState<string>("0.00");
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [users, setUsers] = useState<UserSummary[] | undefined>(undefined);
  const [totalRooms, setTotalRooms] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomTypeSummary[]>([]);

  // Fetch initial dashboard metrics
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [rev, bks, rms] = await Promise.all([
          getThisMonthsRevenue(),
          getBookings(),
          getRooms(),
        ]);
        if (mounted) {
          setMonthRevenue(String(rev));
          setBookings(Array.isArray(bks) ? bks : bks?.content ?? []);
          setTotalRooms((Array.isArray(rms) ? rms : rms?.content ?? []).length);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setErrorMessage("Failed to load dashboard data.");
          setIsLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
  const active = countBookingsInProgress(bookings);
  const occupancy =
    totalRooms > 0 ? ((active / totalRooms) * 100).toFixed(1) : "0.0";

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header  */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <Typography variant="subtitle2" color="primary.main" fontWeight={600}>
          {format(new Date(), "EEEE, MMMM do, yyyy")}
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : errorMessage ? (
        <Alert severity="error">{errorMessage}</Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Left Column: Recent Bookings Table */}
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
              }}
            >
              <CardHeader
                title="Recent Bookings"
                titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
                action={
                  <Button
                    size="small"
                    onClick={() => navigate("/admin/bookings")}
                  >
                    View All
                  </Button>
                }
              />
              <Divider />
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                      <TableCell>Confirmation</TableCell>
                      <TableCell>Guest</TableCell>
                      <TableCell>Room</TableCell>
                      <TableCell>Check-in</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookings.slice(0, 8).map((b) => (
                      <TableRow key={b.id} hover>
                        <TableCell
                          sx={{
                            fontFamily: "monospace",
                            fontWeight: 500,
                            fontSize: "0.875rem",
                          }}
                        >
                          {b.confirmationNumber}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            noWrap
                            sx={{ maxWidth: 120 }}
                          >
                            {b.guestFirstName && b.guestLastName
                              ? `${b.guestFirstName} ${b.guestLastName}`
                              : "Guest"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {b.roomTypeName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(parseISO(b.checkInDate), "MMM d, yyyy")}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={b.status} />
                        </TableCell>
                        <TableCell align="right" fontWeight={600}>
                          {formatRevenue(b.totalPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>

          {/* Right Column: KPIs and Operational Widgets */}
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
            <Stack spacing={3}>
              {/* KPI Grid */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <StatCard
                    label="Revenue (Mo)"
                    value={formatRevenue(monthRevenue)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <StatCard
                    label="Occupancy"
                    value={`${occupancy}%`}
                    helper={`${active} / ${totalRooms} occupied`}
                  />
                </Grid>
                <Grid item xs={6}>
                  <StatCard
                    label="Active Bookings"
                    value={String(confirmed.length)}
                    helper="Future arrivals"
                  />
                </Grid>
                <Grid item xs={6}>
                  <StatCard
                    label="Total Rooms"
                    value={String(totalRooms)}
                    helper="In inventory"
                  />
                </Grid>
              </Grid>

              {/* Arrivals/Departures Widget */}
              <DailyActivityWidget bookings={bookings} />
            </Stack>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default AdminDashboard;
