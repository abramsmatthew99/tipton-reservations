import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { Person } from "@mui/icons-material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { resolveAmenityIconName } from "../utils/amenityIcons";

type RoomProps = {
  roomTypeId: string;
  name: string;
  basePrice: string | number;
  maxOccupancy: string | number;
  imageUrls?: string[];
  description: string;
  amenities: Array<{
    id: string | number;
    name?: string;
    iconCode?: string;
    description?: string;
  }>;
  onBookNow?: () => void;
};

function CustomerRoomCard({
  name,
  basePrice,
  maxOccupancy,
  imageUrls,
  description,
  amenities = [],
  onBookNow,
}: RoomProps) {
  const images = imageUrls ?? [];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) {
      setCurrentImageIndex(0);
      return;
    }
    setCurrentImageIndex((prev) => Math.min(prev, images.length - 1));
  }, [images.length]);

  return (
    <Card
      sx={{
        maxWidth: 640,
        borderRadius: 3,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        overflow: "hidden",
        bgcolor: 'background.paper'
      }}
    >
      <Box sx={{ position: "relative", height: 200, bgcolor: "grey.100" }}>
        {images.length > 0 ? (
          <Box
            component="img"
            src={images[currentImageIndex]}
            alt={`${name} image ${currentImageIndex + 1}`}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
              fontSize: 14,
            }}
          >
            No image available
          </Box>
        )}

        {images.length > 1 && (
          <>
            <IconButton
              size="small"
              onClick={() =>
                setCurrentImageIndex((prev) =>
                  prev === 0 ? images.length - 1 : prev - 1
                )
              }
              sx={{
                position: "absolute",
                top: "50%",
                left: 8,
                transform: "translateY(-50%)",
                bgcolor: "rgba(0, 0, 0, 0.45)",
                color: "white",
                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.6)" },
              }}
              aria-label="Previous image"
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() =>
                setCurrentImageIndex((prev) =>
                  prev === images.length - 1 ? 0 : prev + 1
                )
              }
              sx={{
                position: "absolute",
                top: "50%",
                right: 8,
                transform: "translateY(-50%)",
                bgcolor: "rgba(0, 0, 0, 0.45)",
                color: "white",
                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.6)" },
              }}
              aria-label="Next image"
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: "rgba(0, 0, 0, 0.55)",
                color: "white",
                fontSize: 12,
              }}
            >
              {currentImageIndex + 1} / {images.length}
            </Box>
          </>
        )}
      </Box>

      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {name}
          </Typography>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="h5"
              component="span"
              sx={{ color: "secondary.main", fontWeight: 600 }}
            >
              ${basePrice}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              per night
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}>
          <Person fontSize="small" sx={{ color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            Up to {maxOccupancy} guests
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, mb: 1.5, color: "#2d3748" }}
          >
            Amenities:
          </Typography>
          {amenities.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No amenities.
            </Typography>
          ) : (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {amenities.map((amenity) => {
                const iconName = resolveAmenityIconName(amenity.iconCode ?? "");
                const IconComponent = iconName ? MuiIcons[iconName as keyof typeof MuiIcons] : null;

                return (
                  <Chip
                    key={String(amenity.id)}
                    size="small"
                    label={amenity.name ?? `Amenity ${amenity.id}`}
                    color="primary"
                    icon={
                      IconComponent ? (
                        <IconComponent fontSize="small" />
                      ) : undefined
                    }
                  />
                );
              })}
            </Stack>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            onClick={onBookNow}
            disabled={!onBookNow}
            sx={{
              backgroundColor: "primary",
              textTransform: "none",
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "secondary.main",
              },
              "&:disabled": {
                backgroundColor: "#9ca3af",
              },
            }}
          >
            {onBookNow ? "Book Now" : "Select Dates First"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default CustomerRoomCard;
