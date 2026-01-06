import { Fragment, useEffect, useState } from "react";
import type { ComponentType } from "react";
import RoomTypeForm from "../../components/RoomTypeForm";
import { createRoomType, deleteRoomType, getRoomTypes } from "../../apis/roomtype";
import { getAmenities } from "../../apis/amenities";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { resolveAmenityIconName } from "../../utils/amenityIcons";

type AmenityOption = {
  id: string | number;
  name?: string;
  iconCode?: string;
};

type RoomType = {
  id?: string | number;
  name: string;
  description?: string;
  basePrice?: string | number;
  maxOccupancy?: string | number;
  imageUrl?: string;
  imageUrls?: string[];
  amenityIds?: Array<string | number>;
};

const AdminRoomTypes = () => {
  const dropdownData = {
    imageOptions: [
      { id: "img-1", url: "https://example.com/rooms/standard-1.jpg" },
      { id: "img-2", url: "https://example.com/rooms/deluxe-1.jpg" },
      { id: "img-3", url: "https://example.com/rooms/suite-1.jpg" },
    ],
  };

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    maxOccupancy: "",
    imageUrl: dropdownData.imageOptions[0].url,
    amenityIds: [],
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [amenities, setAmenities] = useState<AmenityOption[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const handleSubmit = async () => {
    const res = await createRoomType(createForm);
    setRoomTypes((prev) => (Array.isArray(res) ? res : [...prev, res]));
  };
  const handleDelete = async (id: string | number) => {
    await deleteRoomType(id);
    setRoomTypes((prev) =>
      prev.filter((roomType) => String(roomType.id) !== String(id))
    );
    setExpandedId((prev) => (prev === id ? null : prev));
  };

  useEffect(() => {
    const getStuff = async () => {
      const [amenitiesRes, roomTypesRes] = await Promise.all([
        getAmenities(),
        getRoomTypes(),
      ]);
      setAmenities(amenitiesRes);
      setRoomTypes(roomTypesRes);
    };
    getStuff();
  }, []);

  return (
    <Stack spacing={3}>
      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Create Room Type
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add a new room category, pricing, and amenities.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => setIsCreateOpen((prev) => !prev)}
            >
              {isCreateOpen ? "Hide Form" : "Add Room Type"}
            </Button>
          </Box>
          <Collapse in={isCreateOpen}>
            <RoomTypeForm
              title=""
              submitLabel="Save"
              formIdPrefix="create"
              formState={createForm}
              setFormState={setCreateForm}
              dropdownData={dropdownData}
              amenitiesOptions={amenities}
              onSubmit={handleSubmit}
            />
          </Collapse>
        </Stack>
      </Paper>

      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Existing Room Types
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage pricing and occupancy details for each room category.
            </Typography>
          </Box>
          <Divider />
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Base Price</TableCell>
                  <TableCell>Max Occupancy</TableCell>
                  <TableCell align="right">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roomTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="body2" color="text.secondary">
                        No room types found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  roomTypes.map((roomType, index) => {
                    const rowId = roomType.id ?? index;
                    const isExpanded = expandedId === rowId;
                    const selectedAmenityIds = roomType.amenityIds ?? [];
                    return (
                      <Fragment key={rowId}>
                        <TableRow hover>
                          <TableCell>{roomType.name}</TableCell>
                          <TableCell>{roomType.basePrice ?? "-"}</TableCell>
                          <TableCell>{roomType.maxOccupancy ?? "-"}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setExpandedId((prev) =>
                                  prev === rowId ? null : rowId
                                )
                              }
                              aria-label={
                                isExpanded
                                  ? "Hide room type details"
                                  : "View room type details"
                              }
                            >
                              {isExpanded ? (
                                <ExpandLessIcon fontSize="small" />
                              ) : (
                                <ExpandMoreIcon fontSize="small" />
                              )}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={4} sx={{ p: 0 }}>
                            <Collapse
                              in={isExpanded}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ p: { xs: 2, md: 3 } }}>
                                <Stack spacing={2}>
                                  <Box>
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={600}
                                    >
                                      Description
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {roomType.description?.trim() ||
                                        "No description provided."}
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={600}
                                    >
                                      Images
                                    </Typography>
                                    {(roomType.imageUrls?.length ||
                                      roomType.imageUrl) ? (
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        mt={1}
                                        flexWrap="wrap"
                                      >
                                        {(roomType.imageUrls ??
                                          (roomType.imageUrl
                                            ? [roomType.imageUrl]
                                            : []))!.map((url, urlIndex) => (
                                          <Box
                                            key={`${rowId}-image-${urlIndex}`}
                                            component="img"
                                            src={url}
                                            alt={`${roomType.name} ${urlIndex + 1}`}
                                            sx={{
                                              width: 160,
                                              height: 100,
                                              objectFit: "cover",
                                              borderRadius: 1,
                                              border: "1px solid",
                                              borderColor: "divider",
                                            }}
                                          />
                                        ))}
                                      </Stack>
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        No image.
                                      </Typography>
                                    )}
                                  </Box>
                                  <Box>
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={600}
                                    >
                                      Amenities
                                    </Typography>
                                    {selectedAmenityIds.length > 0 ? (
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        mt={1}
                                        flexWrap="wrap"
                                      >
                                        {selectedAmenityIds.map(
                                          (amenityId) => {
                                            const match = amenities.find(
                                              (amenity) =>
                                                String(amenity.id) ===
                                                String(amenityId)
                                            );
                                            const iconName =
                                              resolveAmenityIconName(
                                                match?.iconCode ?? ""
                                              );
                                            const IconComponent = iconName
                                              ? (
                                                  MuiIcons as Record<
                                                    string,
                                                    ComponentType<{
                                                      fontSize?:
                                                        | "small"
                                                        | "inherit"
                                                        | "medium"
                                                        | "large";
                                                    }>
                                                  >
                                                )[iconName]
                                              : null;
                                            return (
                                              <Chip
                                                key={String(amenityId)}
                                                size="small"
                                                label={
                                                  match?.name ??
                                                  `Amenity ${amenityId}`
                                                }
                                                icon={
                                                  IconComponent ? (
                                                    <IconComponent fontSize="small" />
                                                  ) : undefined
                                                }
                                              />
                                            );
                                          }
                                        )}
                                      </Stack>
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        No amenities assigned.
                                      </Typography>
                                    )}
                                  </Box>
                                  <Box
                                    display="flex"
                                    justifyContent="flex-end"
                                    pt={1}
                                  >
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      disabled={roomType.id == null}
                                      onClick={() => {
                                        if (roomType.id == null) return;
                                        const confirmed = window.confirm(
                                          "Are you sure you want to delete this room type?"
                                        );
                                        if (!confirmed) return;
                                        handleDelete(roomType.id);
                                      }}
                                    >
                                      Delete Room Type
                                    </Button>
                                  </Box>
                                </Stack>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default AdminRoomTypes;
