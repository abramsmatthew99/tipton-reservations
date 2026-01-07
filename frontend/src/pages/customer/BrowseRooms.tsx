import { useEffect, useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import CustomerRoomCard from "../../components/CustomerRoomCard";
import CustomerDateFilter from "../../components/CustomerDateFilter";
import SearchPage from "../../components/SearchPage";

const BrowseRooms = () => {
  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" fontWeight={600}>
          Browse Rooms
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Filter available rooms by date and num of guests.
        </Typography>
      </Box>
      <SearchPage />
    </Stack>
  );
};

export default BrowseRooms;
