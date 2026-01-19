import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress
} from "@mui/material";
import CustomerRoomCard from "./CustomerRoomCard";
import CustomerFilterComponent from "./CustomerFilterComponent";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAmenities } from "../apis/amenities";
import type { BookingFormState } from "../types/booking";
import { useEffect, useMemo, useState } from "react";
import { getRoomTypes, getRoomTypesByDateAndGuests } from "../apis/roomtype";
import SearchIcon from '@mui/icons-material/Search';
import HotelIcon from '@mui/icons-material/Hotel';
import { format, addDays } from "date-fns";

// Types
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
  const navigate = useNavigate();

  // --- STATE ---
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    maxPrice: 0,
    amenityIds: [] as Array<string | number>,
  });

  // URL Params
  const urlCheckIn = searchParams.get("checkInDate");
  const urlCheckOut = searchParams.get("checkOutDate");
  const urlGuests = searchParams.get("guests");
  const searchCriteriaValid = urlCheckIn && urlCheckOut && urlGuests;

  // Local Input State
  const [localCheckIn, setLocalCheckIn] = useState<string>(urlCheckIn || format(new Date(), 'yyyy-MM-dd'));
  const [localCheckOut, setLocalCheckOut] = useState<string>(urlCheckOut || format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [localGuests, setLocalGuests] = useState<number>(urlGuests ? Number(urlGuests) : 1);

  useEffect(() => {
    if (urlCheckIn) setLocalCheckIn(urlCheckIn);
    if (urlCheckOut) setLocalCheckOut(urlCheckOut);
    if (urlGuests) setLocalGuests(Number(urlGuests));
  }, [urlCheckIn, urlCheckOut, urlGuests]);

  // --- HANDLERS ---
  const handleSearchClick = () => {
    setSearchParams({
      checkInDate: localCheckIn,
      checkOutDate: localCheckOut,
      guests: String(localGuests),
    });
  };

  const calculateNights = (checkIn: string, checkOut: string): number => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleBookNow = (roomType: RoomType) => {
    if (!urlCheckIn || !urlCheckOut) {
        handleSearchClick(); 
        return; 
    }

    const basePrice = Number(roomType.basePrice) || 0;
    const numberOfNights = calculateNights(urlCheckIn, urlCheckOut);
    const totalPrice = basePrice * numberOfNights;
    const imageList = roomType.imageUrls ?? (roomType.imageUrl ? [roomType.imageUrl] : []);

    const bookingData: BookingFormState = {
      roomTypeId: String(roomType.id),
      roomTypeName: roomType.name,
      roomTypeImage: imageList[0],
      roomTypeImages: imageList,
      roomTypeDescription: roomType.description,
      basePrice: basePrice,
      checkInDate: urlCheckIn,
      checkOutDate: urlCheckOut,
      numberOfGuests: Number(urlGuests) || 1,
      numberOfNights: numberOfNights,
      totalPrice: totalPrice,
    };

    navigate("/booking/confirm", {
      state: { bookingData, searchParams: searchParams.toString() },
    });
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [amenitiesRes, roomTypesRes] = await Promise.all([
          getAmenities(),
          searchCriteriaValid
            ? await getRoomTypesByDateAndGuests(urlCheckIn, urlCheckOut, Number(urlGuests))
            : await getRoomTypes(),
        ]);

        const amenitiesById = new Map(
          amenitiesRes.map((amenity: Amenity) => [String(amenity.id), amenity])
        );
        
        const enrichedRoomTypes = (Array.isArray(roomTypesRes) ? roomTypesRes : []).map((roomType: RoomType) => ({
          ...roomType,
          amenities: (roomType.amenityIds ?? [])
            .map((id) => amenitiesById.get(String(id)))
            .filter((amenity): amenity is Amenity => amenity !== undefined),
        }));

        setAmenities(amenitiesRes);
        setRoomTypes(enrichedRoomTypes);
      } catch (err) {
        console.error("Failed to load search data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [urlCheckIn, urlCheckOut, urlGuests, searchCriteriaValid]);

  // --- FILTERING ---
  const maxBasePrice = useMemo(() => {
    if (roomTypes.length === 0) return 0;
    return roomTypes.reduce((maxValue, roomType) => {
      const numericPrice = Number(roomType.basePrice) || 0;
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
      const numericPrice = Number(roomType.basePrice) || 0;
      if (hasPriceFilter && numericPrice > filters.maxPrice) return false;
      if (selectedAmenityIds.length > 0) {
        const roomAmenityIds = (roomType.amenityIds ?? []).map(String);
        const hasAll = selectedAmenityIds.every((id) => roomAmenityIds.includes(id));
        if (!hasAll) return false;
      }
      return true;
    });
  }, [roomTypes, filters]);

  // --- RENDER ---
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 3, 
        alignItems: 'flex-start', 
        p:3
      }}
    >
      
      {/* LEFT COLUMN (SIDEBAR) */}
      <Box 
        sx={{ 
          width: { xs: '100%', md: 320 }, 
          flexShrink: 0 
        }}
      >
        <Stack spacing={3}>
          {/* 1. SEARCH INPUTS */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SearchIcon fontSize="small" color="primary" /> Search
            </Typography>
            <Stack spacing={2} mt={2}>
              <TextField
                label="Check-in"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={localCheckIn}
                onChange={(e) => setLocalCheckIn(e.target.value)}
              />
              <TextField
                label="Check-out"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={localCheckOut}
                onChange={(e) => setLocalCheckOut(e.target.value)}
              />
              <TextField
                label="Guests"
                type="number"
                fullWidth
                InputProps={{ inputProps: { min: 1, max: 10 } }}
                value={localGuests}
                onChange={(e) => setLocalGuests(Number(e.target.value))}
              />
              <Button variant="contained" size="large" onClick={handleSearchClick}>
                Check Availability
              </Button>
            </Stack>
          </Paper>

          {/* 2. FILTERS */}
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
             <CustomerFilterComponent
                amenities={amenities}
                maxPrice={maxBasePrice}
                onChange={setFilters}
              />
          </Paper>
        </Stack>
      </Box>

      {/* RIGHT COLUMN (RESULTS) */}
      <Box sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
        {loading ? (
           <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
              <CircularProgress />
           </Box>
        ) : filteredRoomTypes.length === 0 ? (
           <Box 
             display="flex" 
             flexDirection="column" 
             alignItems="center" 
             justifyContent="center" 
             py={10} 
             bgcolor="grey.50" 
             borderRadius={2}
             border="1px dashed"
             borderColor="divider"
           >
              <HotelIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No rooms found.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                 Try adjusting your dates or filters.
              </Typography>
           </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredRoomTypes.map((roomType, index) => {
              const imageList = roomType.imageUrls ?? (roomType.imageUrl ? [roomType.imageUrl] : []);

              return (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={roomType.id ?? index}>
                  <CustomerRoomCard
                    roomTypeId={String(roomType.id ?? index)}
                    name={roomType.name}
                    basePrice={roomType.basePrice ?? "0"}
                    maxOccupancy={roomType.maxOccupancy ?? 1}
                    imageUrls={imageList}
                    description={roomType.description ?? ""}
                    amenities={roomType?.amenities ?? []}
                    onBookNow={searchCriteriaValid ? () => handleBookNow(roomType) : undefined}
                  />
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Box>
  );
}

export default SearchPage;
