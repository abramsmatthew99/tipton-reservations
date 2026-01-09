import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slider,
  Stack,
  Typography,
} from "@mui/material";

type Amenity = {
  id: string | number;
  name?: string;
};

type CustomerFilterProps = {
  amenities: Amenity[];
  maxPrice: number;
  onChange?: (filters: {
    maxPrice: number;
    amenityIds: Array<string | number>;
  }) => void;
};

const CustomerFilterComponent = ({
  amenities,
  maxPrice,
  onChange,
}: CustomerFilterProps) => {
  const safeMaxPrice = Number.isFinite(maxPrice) ? Math.max(0, maxPrice) : 0;
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(safeMaxPrice);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<
    Array<string | number>
  >([]);

  useEffect(() => {
    setSelectedMaxPrice((prev) => (prev > safeMaxPrice ? safeMaxPrice : prev));
  }, [safeMaxPrice]);

  useEffect(() => {
    if (!onChange) return;
    onChange({
      maxPrice: selectedMaxPrice,
      amenityIds: selectedAmenityIds,
    });
  }, [selectedMaxPrice, selectedAmenityIds, onChange]);

  const amenityOptions = useMemo(
    () => amenities.map((amenity) => ({ ...amenity, key: String(amenity.id) })),
    [amenities]
  );

  const handleAmenityToggle = (amenityId: string | number) => {
    setSelectedAmenityIds((prev) => {
      const id = String(amenityId);
      if (prev.some((existing) => String(existing) === id)) {
        return prev.filter((existing) => String(existing) !== id);
      }
      return [...prev, amenityId];
    });
  };

  const handleReset = () => {
    setSelectedMaxPrice(safeMaxPrice);
    setSelectedAmenityIds([]);
  };

  const hasFilters =
    selectedMaxPrice !== safeMaxPrice || selectedAmenityIds.length > 0;

  return (
    <Card elevation={2}>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={600}>
              Filters
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={handleReset}
              disabled={!hasFilters}
            >
              Clear
            </Button>
          </Stack>

          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" fontWeight={500}>
                Price per night
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${0} - ${selectedMaxPrice.toFixed(0)}
              </Typography>
            </Stack>
            <Slider
              value={selectedMaxPrice}
              onChange={(_, value) =>
                setSelectedMaxPrice(Array.isArray(value) ? value[0] : value)
              }
              min={0}
              max={safeMaxPrice}
              valueLabelDisplay="auto"
              sx={{ mt: 1 }}
            />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={500} gutterBottom>
              Amenities
            </Typography>
            {amenityOptions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No amenities available.
              </Typography>
            ) : (
              <FormGroup>
                {amenityOptions.map((amenity) => {
                  const isChecked = selectedAmenityIds.some(
                    (selectedId) => String(selectedId) === amenity.key
                  );
                  return (
                    <FormControlLabel
                      key={amenity.key}
                      control={
                        <Checkbox
                          checked={isChecked}
                          onChange={() => handleAmenityToggle(amenity.id)}
                        />
                      }
                      label={amenity.name ?? `Amenity ${amenity.id}`}
                    />
                  );
                })}
              </FormGroup>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CustomerFilterComponent;
