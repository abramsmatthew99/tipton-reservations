import { useState } from "react";
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
  TextField,
  Typography,
} from "@mui/material";
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
  const [localCheckIn, setLocalCheckIn] = useState(checkInDate || "");
  const [localCheckOut, setLocalCheckOut] = useState(checkOutDate || "");
  const [localGuests, setLocalGuests] = useState(guests || 2);
  const [error, setError] = useState("");

  const handleSearchClick = () => {
    if (!localCheckIn || !localCheckOut || !localGuests) {
      setError("Please select check-in, check-out, and guests.");
      return;
    }

    setError("");
    onSearch(localCheckIn, localCheckOut, localGuests);
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Check-in"
              type="date"
              value={localCheckIn}
              onChange={(e) => setLocalCheckIn(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Check-out"
              type="date"
              value={localCheckOut}
              onChange={(e) => setLocalCheckOut(e.target.value)}
              InputLabelProps={{ shrink: true }}
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
              <Button variant="contained" fullWidth onClick={handleSearchClick}>
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
  );
}

export default CustomerDateFilter;
