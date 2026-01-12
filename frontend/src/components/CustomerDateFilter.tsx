import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
type BookingSearchProps = {
  onSearch: (checkIn: string, checkOut: string, guests: number) => void;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
};

function CustomerDateFilter({
  onSearch,
  checkInDate,
  checkOutDate,
  guests,
}: BookingSearchProps) {
  const [localCheckIn, setLocalCheckIn] = useState<Dayjs | null>(
    checkInDate ? dayjs(checkInDate) : null
  );
  const [localCheckOut, setLocalCheckOut] = useState<Dayjs | null>(
    checkOutDate ? dayjs(checkOutDate) : null
  );
  const [localGuests, setLocalGuests] = useState(guests || 2);
  const [error, setError] = useState("");

  const isCheckInPast = useMemo(() => {
    if (!localCheckIn) return false;
    return localCheckIn.isBefore(dayjs(), "day");
  }, [localCheckIn]);

  const isValidDateRange = useMemo(() => {
    if (!localCheckIn || !localCheckOut) return false;
    return localCheckOut.isAfter(localCheckIn);
  }, [localCheckIn, localCheckOut]);

  const handleSearchClick = () => {
    if (!localCheckIn || !localCheckOut || !localGuests) {
      setError("Please select check-in, check-out, and guests.");
      return;
    }

    if (isCheckInPast || !isValidDateRange) {
      setError("Please select a valid date range.");
      return;
    }

    setError("");
    onSearch(
      localCheckIn.format("YYYY-MM-DD"),
      localCheckOut.format("YYYY-MM-DD"),
      localGuests
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card elevation={2}>
        <CardContent>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Check-in"
                value={localCheckIn}
                onChange={(newValue) => setLocalCheckIn(newValue)}
                disablePast
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: isCheckInPast,
                    helperText: isCheckInPast
                      ? "Check-in date cannot be in the past"
                      : "",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Check-out"
                value={localCheckOut}
                onChange={(newValue) => setLocalCheckOut(newValue)}
                minDate={localCheckIn?.add(1, "day")}
                disablePast
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: localCheckOut ? !isValidDateRange : false,
                    helperText:
                      localCheckOut && !isValidDateRange
                        ? "Check-out must be after check-in"
                        : "",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="guests-label">Guests</InputLabel>
                <Select
                  labelId="guests-label"
                  label="Guests"
                  value={localGuests}
                  onChange={(e) => setLocalGuests(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, index) => index + 1).map(
                    (count) => (
                      <MenuItem key={count} value={count}>
                        {count} {count === 1 ? "Guest" : "Guests"}
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack spacing={1}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSearchClick}
                >
                  Search
                </Button>
                {error ? (
                  <Typography variant="body2" color="error">
                    {error}
                  </Typography>
                ) : null}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}

export default CustomerDateFilter;
