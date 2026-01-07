import { useEffect, useState } from "react";
import { getAmenities } from "../../apis/amenities";
import { getRoomTypes } from "../../apis/roomtype";
import { Box, Stack, Typography } from "@mui/material";
import CustomerRoomCard from "../../components/CustomerRoomCard";
import CustomerDateFilter from "../../components/CustomerDateFilter";
type Amenity = {
  id: string | number;
  name?: string;
  iconCode?: string;
  description?: string;
};

type RoomType = {
  id?: string | number;
  name: string;
  description?: string;
  basePrice?: string | number;
  maxOccupancy?: string | number;
  imageUrls?: string[];
  imageUrl?: string;
  amenityIds?: Array<string | number>;
  amenities?: Amenity[];
};

const BrowseRooms = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [amenitiesRes, roomTypesRes] = await Promise.all([
        getAmenities(),
        getRoomTypes(),
      ]);
      const amenitiesById = new Map(
        amenitiesRes.map((amenity: Amenity) => [String(amenity.id), amenity])
      );
      const enrichedRoomTypes = roomTypesRes.map((roomType: RoomType) => ({
        ...roomType,
        amenities: (roomType.amenityIds ?? [])
          .map((id) => amenitiesById.get(String(id)))
          .filter(Boolean),
      }));
      setRoomTypes(enrichedRoomTypes);
    };

    loadData();
  }, []);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" fontWeight={600}>
          Browse Rooms
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Filter available rooms by date and num of guests.
        </Typography>
        <CustomerDateFilter></CustomerDateFilter>
      </Box>
      <Stack spacing={2}>
        {roomTypes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No room types available.
          </Typography>
        ) : (
          roomTypes.map((roomType, index) => {
            const imageList =
              roomType.imageUrls ??
              (roomType.imageUrl ? [roomType.imageUrl] : []);

            return (
              <CustomerRoomCard
                key={roomType.id ?? index}
                name={roomType.name}
                basePrice={roomType.basePrice ?? "0"}
                maxOccupancy={roomType.maxOccupancy ?? 1}
                imageUrls={imageList[0] ?? undefined}
                description={roomType.description ?? ""}
                amenities={roomType?.amenities ?? []}
              />
            );
          })
        )}
      </Stack>
    </Stack>
  );
};

export default BrowseRooms;
