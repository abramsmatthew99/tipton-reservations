import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Stack,
} from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { Person } from "@mui/icons-material";
import { resolveAmenityIconName } from "../utils/amenityIcons";

type RoomProps = {
  roomTypeId: string;
  name: string;
  basePrice: string | number;
  maxOccupancy: string | number;
  imageUrls?: string;
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
      <CardMedia
        component="img"
        height="200"
        image={imageUrls || undefined}
        alt={name}
        sx={{ objectFit: "cover" }}
      />

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
