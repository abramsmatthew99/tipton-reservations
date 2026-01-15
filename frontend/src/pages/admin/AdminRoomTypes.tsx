import { Fragment, useEffect, useMemo, useState } from "react";
import RoomTypeForm from "../../components/RoomTypeForm";
import { createRoomType, deleteRoomType, editRoomType, getRoomTypes } from "../../apis/roomtype";
import { getAmenities } from "../../apis/amenities";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  Collapse,
  Divider,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { resolveAmenityIconName } from "../../utils/amenityIcons";

type AmenityOption = { id: string | number; name?: string; iconCode?: string; };
type RoomType = { id?: string | number; name: string; description?: string; basePrice?: string | number; maxOccupancy?: string | number; imageUrl?: string; imageUrls?: string[]; amenityIds?: Array<string | number>; };

const AdminRoomTypes = () => {
  const dropdownData = {
    imageOptions: [
      { id: "img-1", url: "https://example.com/rooms/standard-1.jpg" },
      { id: "img-2", url: "https://example.com/rooms/deluxe-1.jpg" },
      { id: "img-3", url: "https://example.com/rooms/suite-1.jpg" },
    ],
  };

  const [createForm, setCreateForm] = useState<{ name: string; description: string; basePrice: string; maxOccupancy: string; imageUrl: string; amenityIds?: string[]; }>({
    name: "", description: "", basePrice: "", maxOccupancy: "", imageUrl: dropdownData.imageOptions[0].url, amenityIds: [],
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editRoomTypeId, setEditRoomTypeId] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState(createForm); // Simplified Init

  const [amenities, setAmenities] = useState<AmenityOption[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [roomTypeFilterId, setRoomTypeFilterId] = useState("all");
  const [occupancyFilter, setOccupancyFilter] = useState("all");

  const occupancyOptions = useMemo(() => Array.from({ length: 12 }, (_, index) => String(index + 1)), []);
  
  const filteredRoomTypes = useMemo(() => {
    return roomTypes.filter((roomType) => {
      if (roomTypeFilterId !== "all" && String(roomType.id) !== roomTypeFilterId) return false;
      if (occupancyFilter === "all") return true;
      const occupancyValue = roomType.maxOccupancy === null || roomType.maxOccupancy === undefined ? "" : String(roomType.maxOccupancy);
      return occupancyValue === occupancyFilter;
    });
  }, [roomTypes, roomTypeFilterId, occupancyFilter]);

  const hasRoomTypeFilters = roomTypeFilterId !== "all" || occupancyFilter !== "all";

  // Handlers (Keep logic same)
  const handleSubmit = async () => {
    const res = await createRoomType(createForm);
    setRoomTypes((prev) => (Array.isArray(res) ? res : [...prev, res]));
    setIsCreateOpen(false);
  };
  const handleDelete = async (id: string | number) => {
    await deleteRoomType(id);
    setRoomTypes((prev) => prev.filter((roomType) => String(roomType.id) !== String(id)));
    setExpandedId((prev) => (prev === id ? null : prev));
  };
  const handleEditToggle = (roomType: RoomType, rowId: string | number) => {
    if (editRoomTypeId === rowId) { setEditRoomTypeId(null); return; }
    setEditRoomTypeId(rowId);
    setEditForm({
      name: roomType.name ?? "",
      description: roomType.description ?? "",
      basePrice: roomType.basePrice === undefined || roomType.basePrice === null ? "" : String(roomType.basePrice),
      maxOccupancy: roomType.maxOccupancy === undefined || roomType.maxOccupancy === null ? "" : String(roomType.maxOccupancy),
      imageUrl: roomType.imageUrl || roomType.imageUrls?.[0] || dropdownData.imageOptions[0].url,
      amenityIds: (roomType.amenityIds ?? []).map((id) => String(id)),
    });
  };
  const handleEditSubmit = async (roomTypeId: string | number) => {
    const normalizeNumber = (value: string) => value.trim() === "" ? null : Number(value);
    const payload = { roomId: roomTypeId, ...editForm, basePrice: normalizeNumber(editForm.basePrice), maxOccupancy: normalizeNumber(editForm.maxOccupancy) };
    const res = await editRoomType(payload);
    setRoomTypes((prev) => {
      if (Array.isArray(res)) return res;
      if (!res) return prev;
      return prev.map((roomType) => String(roomType.id) === String(roomTypeId) ? { ...roomType, ...res } : roomType);
    });
    setEditRoomTypeId(null);
  };

  useEffect(() => {
    const getStuff = async () => {
      const [amenitiesRes, roomTypesRes] = await Promise.all([getAmenities(), getRoomTypes()]);
      setAmenities(amenitiesRes);
      setRoomTypes(roomTypesRes);
    };
    getStuff();
  }, []);

  return (
    <Stack spacing={3}>
      
      {/* 1. CREATE ACTION */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: isCreateOpen ? 'grey.50' : 'transparent' }}>
            <Box>
                <Typography variant="subtitle1" fontWeight={700}>Define Room Type</Typography>
                <Typography variant="body2" color="text.secondary">Setup a new category of room with pricing and amenities.</Typography>
            </Box>
            <Button 
                variant={isCreateOpen ? "outlined" : "contained"} 
                startIcon={isCreateOpen ? <CloseIcon /> : <AddIcon />}
                onClick={() => setIsCreateOpen((prev) => !prev)}
            >
                {isCreateOpen ? "Cancel" : "Add Type"}
            </Button>
        </Box>
        <Collapse in={isCreateOpen}>
            <Divider />
            <Box sx={{ p: 3 }}>
                <RoomTypeForm
                    title=""
                    submitLabel="Save Room Type"
                    formIdPrefix="create"
                    formState={createForm}
                    setFormState={setCreateForm}
                    dropdownData={dropdownData}
                    amenitiesOptions={amenities}
                    onSubmit={handleSubmit}
                />
            </Box>
        </Collapse>
      </Card>

      {/* 2. LISTING */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardHeader title="Room Types" titleTypographyProps={{ variant: 'h6', fontWeight: 700 }} />
        <Divider />
        
        {/* FILTER BAR */}
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                    select size="small" label="Type"
                    value={roomTypeFilterId}
                    onChange={(e) => setRoomTypeFilterId(e.target.value)}
                    sx={{ minWidth: 200, bgcolor: 'white' }}
                >
                    <MenuItem value="all">All Types</MenuItem>
                    {roomTypes.map((rt) => <MenuItem key={rt.id} value={String(rt.id)}>{rt.name}</MenuItem>)}
                </TextField>
                <TextField
                    select size="small" label="Occupancy"
                    value={occupancyFilter}
                    onChange={(e) => setOccupancyFilter(e.target.value)}
                    sx={{ minWidth: 150, bgcolor: 'white' }}
                >
                    <MenuItem value="all">Any</MenuItem>
                    {occupancyOptions.map((v) => <MenuItem key={v} value={v}>{v} Guests</MenuItem>)}
                </TextField>
                <Button disabled={!hasRoomTypeFilters} onClick={() => { setRoomTypeFilterId("all"); setOccupancyFilter("all"); }}>
                    Reset
                </Button>
            </Stack>
        </Box>
        <Divider />

        <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Base Price</TableCell>
                  <TableCell>Max Occupancy</TableCell>
                  <TableCell align="right">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRoomTypes.map((roomType, index) => {
                    const rowId = roomType.id ?? index;
                    const isExpanded = expandedId === rowId;
                    const isEditing = editRoomTypeId === rowId;
                    const selectedAmenityIds = roomType.amenityIds ?? [];

                    return (
                      <Fragment key={rowId}>
                        <TableRow hover selected={isExpanded}>
                          <TableCell sx={{ fontWeight: 600 }}>{roomType.name}</TableCell>
                          <TableCell>${roomType.basePrice}</TableCell>
                          <TableCell>{roomType.maxOccupancy} Guests</TableCell>
                          <TableCell align="right">
                            <Button 
                                size="small" 
                                endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                onClick={() => setExpandedId(prev => prev === rowId ? null : rowId)}
                            >
                                {isExpanded ? "Close" : "View"}
                            </Button>
                          </TableCell>
                        </TableRow>
                        
                        {/* EXPANDED DETAILS */}
                        <TableRow>
                          <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              <Box sx={{ p: 3, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
                                <Grid container spacing={4}>
                                    {/* COL 1: INFO & IMAGES */}
                                    <Grid size={{ xs: 12, md: 5 }}>
                                        <Typography variant="overline" color="text.secondary" fontWeight={700}>Description</Typography>
                                        <Typography variant="body2" paragraph>{roomType.description || "No description provided."}</Typography>
                                        
                                        <Box mt={2}>
                                            <Typography variant="overline" color="text.secondary" fontWeight={700}>Images</Typography>
                                            <Stack direction="row" spacing={1} mt={1}>
                                                {(roomType.imageUrls ?? (roomType.imageUrl ? [roomType.imageUrl] : []))
                                                    .map((url, i) => (
                                                        <Box key={i} component="img" src={url} 
                                                            sx={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }} 
                                                        />
                                                    ))
                                                }
                                            </Stack>
                                        </Box>
                                    </Grid>

                                    {/* COL 2: AMENITIES */}
                                    <Grid size={{ xs: 12, md: 7 }}>
                                        <Typography variant="overline" color="text.secondary" fontWeight={700}>Amenities</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                            {selectedAmenityIds.map(id => {
                                                const am = amenities.find(a => String(a.id) === String(id));
                                                if (!am) return null;
                                                const iconName = resolveAmenityIconName(am.iconCode ?? "");
                                                const Icon = iconName ? (MuiIcons as any)[iconName] : null;
                                                return <Chip key={id} size="small" label={am.name} icon={Icon ? <Icon /> : undefined} />;
                                            })}
                                        </Box>
                                        
                                        <Divider sx={{ my: 3 }} />
                                        
                                        <Box display="flex" justifyContent="flex-end" gap={2}>
                                            <Button variant="outlined" size="small" onClick={() => handleEditToggle(roomType, rowId)}>
                                                {isEditing ? "Close Editor" : "Edit Details"}
                                            </Button>
                                            <Button variant="outlined" color="error" size="small" onClick={() => roomType.id && handleDelete(roomType.id)}>
                                                Delete Type
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>

                                {/* INLINE EDITOR */}
                                <Collapse in={isEditing} unmountOnExit>
                                    <Box sx={{ mt: 3, p: 3, bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                      <RoomTypeForm
                                        title="Edit Room Type"
                                        submitLabel="Update"
                                        formIdPrefix={`edit-${rowId}`}
                                        formState={editForm}
                                        setFormState={setEditForm}
                                        dropdownData={dropdownData}
                                        amenitiesOptions={amenities}
                                        onSubmit={() => roomType.id && handleEditSubmit(roomType.id)}
                                        showImageField={false}
                                      />
                                    </Box>
                                </Collapse>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    );
                })}
              </TableBody>
            </Table>
        </TableContainer>
      </Card>
    </Stack>
  );
};

export default AdminRoomTypes;