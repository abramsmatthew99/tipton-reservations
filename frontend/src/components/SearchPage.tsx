import { Box, Card, Stack, Typography } from "@mui/material";
import CustomerDateFilter from "./CustomerDateFilter";
import CustomerRoomCard from "./CustomerRoomCard";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAmenities } from "../apis/amenities";
import type { BookingFormState } from "../types/booking";
import { useEffect, useMemo, useState } from "react";
import { getRoomTypes, getRoomTypesByDateAndGuests } from "../apis/roomtype";
import CustomerFilterComponent from "./CustomerFilterComponent";

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
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [filters, setFilters] = useState({
    maxPrice: 0,
    amenityIds: [] as Array<string | number>,
  });
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
      setAmenities(amenitiesRes);
      setRoomTypes(enrichedRoomTypes);
    };

    loadData();
  }, [checkInDate, checkOutDate, guests, searchCriteria]);
  const maxBasePrice = useMemo(() => {
    if (roomTypes.length === 0) return 0;
    return roomTypes.reduce((maxValue, roomType) => {
      const numericPrice =
        roomType.basePrice === null || roomType.basePrice === undefined
          ? 0
          : Number(roomType.basePrice);
      if (Number.isNaN(numericPrice)) return maxValue;
      return Math.max(maxValue, numericPrice);
    }, 0);
  }, [roomTypes]);
  useEffect(() => {
    if (maxBasePrice === 0) return;
    setFilters((prev) => {
      if (prev.maxPrice === 0 || prev.maxPrice > maxBasePrice) {
        return { ...prev, maxPrice: maxBasePrice };
      }
      return prev;
    });
  }, [maxBasePrice]);
  const filteredRoomTypes = useMemo(() => {
    const hasPriceFilter = filters.maxPrice > 0;
    const selectedAmenityIds = filters.amenityIds.map(String);
    return roomTypes.filter((roomType) => {
      const numericPrice =
        roomType.basePrice === null || roomType.basePrice === undefined
          ? 0
          : Number(roomType.basePrice);
      if (
        hasPriceFilter &&
        !Number.isNaN(numericPrice) &&
        numericPrice > filters.maxPrice
      ) {
        return false;
      }
      if (selectedAmenityIds.length === 0) {
        return true;
      }
      const roomAmenityIds = (roomType.amenityIds ?? []).map(String);
      return selectedAmenityIds.every((id) => roomAmenityIds.includes(id));
    });
  }, [roomTypes, filters]);
  return (
    <>
      <CustomerDateFilter
        onSearch={handleSearch}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate} //@ts-ignore
        guests={guests}
      ></CustomerDateFilter>
      <Box display="flex" gap={3} alignItems="flex-start" flexWrap="wrap">
        <Box
          component={Card}
          flex={{ xs: "1 1 100%", md: "0 0 320px" }}
          sx={{ p: 2 }}
        >
          <CustomerFilterComponent
            amenities={amenities}
            maxPrice={maxBasePrice}
            onChange={setFilters}
          />
        </Box>
        <Box flex="1 1 0%">
          <Stack spacing={2}>
            {filteredRoomTypes.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {roomTypes.length === 0
                  ? "No room types available."
                  : "No room types match the current filters."}
              </Typography>
            ) : (
              filteredRoomTypes.map((roomType, index) => {
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
        </Box>
      </Box>
    </>
  );
}

export default SearchPage;
