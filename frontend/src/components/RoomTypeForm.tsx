import { useState } from "react";
import type { ComponentType } from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

import { resolveAmenityIconName } from "../utils/amenityIcons";

type RoomTypeFormState = {
  name: string;
  description: string;
  basePrice: string;
  maxOccupancy: string;
  imageUrls: string[];
  amenityIds?: string[];
};

type AmenityOption = {
  id: string | number;
  name?: string;
  iconCode?: string;
  description?: string;
};

type RoomTypeFormProps = {
  title: string;
  submitLabel: string;
  formIdPrefix: string;
  formState: RoomTypeFormState;
  setFormState: (nextState: RoomTypeFormState) => void;
  amenitiesOptions?: AmenityOption[];
  onSubmit: () => void;
  showImageUpload?: boolean;
  imageFileNames?: string[];
  onImageFilesChange?: (files: File[]) => void;
};

function RoomTypeForm({
  title,
  submitLabel,
  formIdPrefix,
  formState,
  setFormState,
  amenitiesOptions,
  onSubmit,
  showImageUpload = true,
  imageFileNames,
  onImageFilesChange,
}: RoomTypeFormProps) {
  const [amenitySelectValue, setAmenitySelectValue] = useState("");
  const selectedAmenityIds = formState.amenityIds ?? [];

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={600}>
          {title}
        </Typography>

        <TextField
          id={`${formIdPrefix}-name`}
          label="Name"
          value={formState.name}
          onChange={(event) =>
            setFormState({ ...formState, name: event.target.value })
          }
          fullWidth
        />

        <TextField
          id={`${formIdPrefix}-description`}
          label="Description"
          value={formState.description}
          onChange={(event) =>
            setFormState({ ...formState, description: event.target.value })
          }
          fullWidth
          multiline
          minRows={3}
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            id={`${formIdPrefix}-base-price`}
            label="Base Price"
            type="number"
            inputProps={{ step: "0.01" }}
            value={formState.basePrice}
            onChange={(event) =>
              setFormState({ ...formState, basePrice: event.target.value })
            }
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id={`${formIdPrefix}-max-occupancy-label`}>
              Max Occupancy
            </InputLabel>
            <Select
              id={`${formIdPrefix}-max-occupancy`}
              labelId={`${formIdPrefix}-max-occupancy-label`}
              label="Max Occupancy"
              value={formState.maxOccupancy}
              onChange={(event) =>
                setFormState({
                  ...formState,
                  maxOccupancy: String(event.target.value),
                })
              }
            >
              {Array.from({ length: 12 }, (_, index) => {
                const value = String(index + 1);
                return (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Stack>

        {showImageUpload && (
          <Stack spacing={1}>
            <Button variant="outlined" component="label">
              Upload Images
              <input
                type="file"
                hidden
                accept="image/*"
                multiple
                onChange={(event) => {
                  const files = event.target.files
                    ? Array.from(event.target.files)
                    : [];
                  onImageFilesChange?.(files);
                }}
              />
            </Button>
            {imageFileNames && imageFileNames.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {imageFileNames.join(", ")}
              </Typography>
            )}
          </Stack>
        )}

        {formState.imageUrls.length > 0 && (
          <Stack spacing={1}>
            <Typography variant="subtitle2">Current Images</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {formState.imageUrls.map((url, index) => (
                <Box
                  key={`${url}-${index}`}
                  sx={{
                    position: "relative",
                    width: 120,
                    height: 80,
                    borderRadius: 1,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    component="img"
                    src={url}
                    alt={`Room image ${index + 1}`}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <IconButton
                    size="small"
                    onClick={() =>
                      setFormState({
                        ...formState,
                        imageUrls: formState.imageUrls.filter(
                          (_, idx) => idx !== index
                        ),
                      })
                    }
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      bgcolor: "rgba(0, 0, 0, 0.6)",
                      color: "white",
                      "&:hover": { bgcolor: "rgba(0, 0, 0, 0.75)" },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Stack>
        )}

        {amenitiesOptions && amenitiesOptions.length > 0 && (
          <Box>
            <FormControl fullWidth>
              <InputLabel id={`${formIdPrefix}-amenities-label`}>
                Amenities
              </InputLabel>
              <Select
                id={`${formIdPrefix}-amenities`}
                labelId={`${formIdPrefix}-amenities-label`}
                label="Amenities"
                value={amenitySelectValue}
                onChange={(event) => {
                  const nextId = String(event.target.value);
                  setAmenitySelectValue("");
                  if (!nextId) return;
                  if (selectedAmenityIds.includes(nextId)) return;
                  setFormState({
                    ...formState,
                    amenityIds: [...selectedAmenityIds, nextId],
                  });
                }}
              >
                <MenuItem value="">Select an amenity</MenuItem>
                {amenitiesOptions.map((amenity) => (
                  <MenuItem key={amenity.id} value={String(amenity.id)}>
                    {amenity.name ?? `Amenity ${amenity.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedAmenityIds.length > 0 && (
              <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                {selectedAmenityIds.map((id) => {
                  const match = amenitiesOptions.find(
                    (amenity) => String(amenity.id) === id
                  );
                  const label = match?.name ?? id;
                  const iconName = resolveAmenityIconName(
                    String(match?.iconCode ?? "")
                  );
                  const IconComponent = iconName
                    ? (
                        MuiIcons as Record<
                          string,
                          ComponentType<{
                            fontSize?: "small" | "inherit" | "medium" | "large";
                          }>
                        >
                      )[iconName]
                    : null;
                  return (
                    <Chip
                      key={id}
                      label={label}
                      size="small"
                      icon={
                        IconComponent ? (
                          <IconComponent fontSize="small" />
                        ) : undefined
                      }
                      onDelete={() =>
                        setFormState({
                          ...formState,
                          amenityIds: selectedAmenityIds.filter(
                            (selectedId) => selectedId !== id
                          ),
                        })
                      }
                      deleteIcon={<CloseIcon fontSize="small" />}
                    />
                  );
                })}
              </Stack>
            )}
          </Box>
        )}

        <Box>
          <Button type="submit" variant="contained">
            {submitLabel}
          </Button>
        </Box>
      </Stack>
    </form>
  );
}

export default RoomTypeForm;
