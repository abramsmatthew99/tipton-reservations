import { Stack, Typography } from "@mui/material";
import CustomerDateFilter from "./CustomerDateFilter";
import CustomerRoomCard from "./CustomerRoomCard";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAmenities } from "../apis/amenities";
import { getRoomTypes, getRoomTypesByDateAndGuests } from "../apis/roomtype";
import type { BookingFormState } from "../types/booking";
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
  const navigate = useNavigate();

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

  // Calculate number of nights between two dates
  const calculateNights = (checkIn: string, checkOut: string): number => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Handle "Book Now" click - navigate to booking confirmation page
  const handleBookNow = (roomType: RoomType) => {
    if (!checkInDate || !checkOutDate) return;

    const basePrice = Number(roomType.basePrice) || 0;
    const numberOfNights = calculateNights(checkInDate, checkOutDate);
    const totalPrice = basePrice * numberOfNights;
    const imageList = roomType.imageUrls ?? (roomType.imageUrl ? [roomType.imageUrl] : []);

    const bookingData: BookingFormState = {
      roomTypeId: String(roomType.id),
      roomTypeName: roomType.name,
      roomTypeImage: imageList[0],
      roomTypeDescription: roomType.description,
      basePrice: basePrice,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      numberOfGuests: guests,
      numberOfNights: numberOfNights,
      totalPrice: totalPrice,
    };

    navigate("/booking/confirm", {
      state: { bookingData, searchParams: searchParams.toString() },
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
                roomTypeId={String(roomType.id ?? index)}
                name={roomType.name}
                basePrice={roomType.basePrice ?? "0"}
                maxOccupancy={roomType.maxOccupancy ?? 1}
                imageUrls={imageList[0] ?? undefined}
                description={roomType.description ?? ""}
                amenities={roomType?.amenities ?? []}
                onBookNow={
                  searchCriteria ? () => handleBookNow(roomType) : undefined
                }
              />
            );
          })
        )}
      </Stack>
    </>
  );
}

export default SearchPage;
