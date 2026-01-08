import { Stack, Typography } from "@mui/material";
import CustomerDateFilter from "./CustomerDateFilter";
import CustomerRoomCard from "./CustomerRoomCard";
import { useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { getAmenities } from "../apis/amenities";
import { getRoomTypes, getRoomTypesByDateAndGuests } from "../apis/roomtype";
import axios from "axios";
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

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkInDate = searchParams.get("checkInDate") || "";
  const checkOutDate = searchParams.get("checkOutDate") || "";
  const rawGuests = searchParams.get("guests");
  const guests = rawGuests ? Number(rawGuests) : 1;

  const searchCriteria = checkInDate && checkOutDate && guests; //true if all of these are filled

  const handleSearch = (
    checkIn: string,
    checkOut: string,
    guestCount: number
  ) => {
    setSearchParams({
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests: String(guestCount),
    });
  };

  useEffect(() => {
    const loadData = async () => {
      const [amenitiesRes, roomTypesRes] = await Promise.all([
        getAmenities(),
        searchCriteria
          ? await getRoomTypesByDateAndGuests(checkInDate, checkOutDate, guests)
          : await getRoomTypes(),
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
  }, [checkInDate, checkOutDate, guests, searchCriteria]);
  return (
    <>
      <CustomerDateFilter
        onSearch={handleSearch}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate} //@ts-ignore
        guests={guests}
      ></CustomerDateFilter>
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
    </>
  );
}

export default SearchPage;
