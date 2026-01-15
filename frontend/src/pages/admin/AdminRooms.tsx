import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import RoomCreateForm from "../../components/RoomCreateForm";
import { getRoomTypes } from "../../apis/roomtype";
import { createRoom, getRooms, editRoom, deleteRoom } from "../../apis/room";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  Collapse,
  Divider,
  IconButton,
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
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

// Types (Keep existing)
type RoomTypeOption = { id: string | number; name: string; };
type Room = { id?: string | number; floor?: number | string | null; roomNumber?: string | number; roomTypeId?: string | number; roomTypeName?: string; };

const AdminRooms = () => {
  // ... Keep all your existing state and logic exactly the same ...
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [editRoomId, setEditRoomId] = useState<string | number | null>(null);
  const [roomTypeFilterId, setRoomTypeFilterId] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [roomNumberQuery, setRoomNumberQuery] = useState("");

  const [createRoomForm, setCreateRoomForm] = useState({ roomTypeId: "", roomNumber: "", floor: "", });
  const [editRoomForm, setEditRoomForm] = useState({ roomTypeId: "", roomNumber: "", floor: "", });
  const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>([]);
  
  const roomTypeById = useMemo(() => {
    const lookup = new Map<string, string>();
    roomTypes.forEach((roomType) => { lookup.set(String(roomType.id), roomType.name); });
    return lookup;
  }, [roomTypes]);

  const availableFloors = useMemo(() => {
    const floors = Array.from(new Set(rooms.map((room) => room.floor).filter((floor) => floor !== null && floor !== undefined).map((floor) => String(floor))));
    return floors.sort((a, b) => Number.parseFloat(a) - Number.parseFloat(b));
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    const query = roomNumberQuery.trim().toLowerCase();
    return rooms.filter((room) => {
      if (roomTypeFilterId !== "all" && String(room.roomTypeId) !== roomTypeFilterId) return false;
      if (floorFilter !== "all" && String(room.floor ?? "") !== floorFilter) return false;
      if (query && !String(room.roomNumber ?? "").toLowerCase().includes(query)) return false;
      return true;
    });
  }, [rooms, roomTypeFilterId, floorFilter, roomNumberQuery]);

  const hasRoomFilters = roomTypeFilterId !== "all" || floorFilter !== "all" || roomNumberQuery.trim() !== "";
  
  const attachRoomTypeName = useCallback((room: Room) => ({ ...room, roomTypeName: roomTypeById.get(String(room.roomTypeId)) ?? "-", }), [roomTypeById]);

  // Keep Handlers
  const handleEditRoom = async (roomId: string | number) => {
    const payload = { roomId, ...editRoomForm, floor: editRoomForm.floor === "" ? null : Number(editRoomForm.floor), };
    const res = await editRoom(payload);
    setRooms((prev) => {
        if (Array.isArray(res)) return res.map(attachRoomTypeName);
        if (!res) return prev;
        return prev.map((room) => room.id === roomId ? attachRoomTypeName({ ...room, ...res }) : room);
    });
    setEditRoomId(null);
  };

  const handleCreateRoom = async () => {
    const payload = { ...createRoomForm, floor: createRoomForm.floor === "" ? null : Number(createRoomForm.floor), };
    const res = await createRoom(payload);
    setRooms((prev) => {
      const nextRooms = Array.isArray(res) ? res : [...prev, res];
      return nextRooms.map(attachRoomTypeName);
    });
  };

  const handleDeleteRoom = async (roomId: string | number) => {
    if(!window.confirm("Delete this room? This action cannot be undone.")) return;
    const res = await deleteRoom(roomId);
    setRooms((prev) => {
      if (Array.isArray(res)) return res.map(attachRoomTypeName);
      return prev.filter((room) => room.id !== roomId);
    });
    if (editRoomId === roomId) setEditRoomId(null);
  };

  const handleEditToggle = (room: Room, roomKey: string | number) => {
    if (editRoomId === roomKey) { setEditRoomId(null); return; }
    setEditRoomId(roomKey);
    setEditRoomForm({
      roomTypeId: String(room.roomTypeId ?? roomTypes[0]?.id ?? ""),
      roomNumber: room.roomNumber ? String(room.roomNumber) : "",
      floor: room.floor === null || room.floor === undefined ? "" : String(room.floor),
    });
  };

  useEffect(() => {
    const getStuff = async () => {
      const [roomTypesRes, roomRes] = await Promise.all([getRoomTypes(), getRooms()]);
      const roomTypeLookup = new Map<string, string>(roomTypesRes.map((roomType) => [String(roomType.id), roomType.name]));
      setRoomTypes(roomTypesRes.filter((rt) => rt.id !== undefined).map((rt) => ({ id: rt.id!, name: rt.name })));
      setRooms(roomRes.map((room) => ({ ...room, roomTypeName: roomTypeLookup.get(String(room.roomTypeId)) ?? "-", })));
    };
    getStuff();
  }, []);

  useEffect(() => {
    if (roomTypes.length === 0) return;
    setCreateRoomForm((prev) => prev.roomTypeId ? prev : { ...prev, roomTypeId: String(roomTypes[0].id) });
  }, [roomTypes, rooms]);

  useEffect(() => {
    if (roomTypes.length === 0) return;
    setRooms((prev) => prev.map(attachRoomTypeName));
  }, [roomTypes, attachRoomTypeName]);

  return (
    <Stack spacing={3}>
      
      {/* 1. CREATE ACTION CARD */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: showCreateRoom ? 'grey.50' : 'transparent' }}>
            <Box>
                <Typography variant="subtitle1" fontWeight={700}>Add New Room</Typography>
                <Typography variant="body2" color="text.secondary">Register a new physical room to the system.</Typography>
            </Box>
            <Button 
                variant={showCreateRoom ? "outlined" : "contained"} 
                startIcon={showCreateRoom ? <CloseIcon /> : <AddIcon />}
                onClick={() => setShowCreateRoom((prev) => !prev)}
            >
                {showCreateRoom ? "Cancel" : "Add Room"}
            </Button>
        </Box>
        <Collapse in={showCreateRoom}>
            <Divider />
            <Box sx={{ p: 3 }}>
                <RoomCreateForm
                    formState={createRoomForm}
                    setFormState={setCreateRoomForm}
                    roomTypes={roomTypes}
                    onSubmit={handleCreateRoom}
                />
            </Box>
        </Collapse>
      </Card>

      {/* 2. INVENTORY CARD */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardHeader 
            title="Room Inventory" 
            titleTypographyProps={{ variant: 'h6', fontWeight: 700 }}
            subheader={`Total rooms: ${rooms.length} | Filtered: ${filteredRooms.length}`}
        />
        <Divider />
        
        {/* FILTER BAR */}
        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                <FilterListIcon color="action" />
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
                    select size="small" label="Floor"
                    value={floorFilter}
                    onChange={(e) => setFloorFilter(e.target.value)}
                    sx={{ minWidth: 140, bgcolor: 'white' }}
                >
                    <MenuItem value="all">All Floors</MenuItem>
                    {availableFloors.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </TextField>
                <TextField
                    size="small" label="Room Number" placeholder="Search..."
                    value={roomNumberQuery}
                    onChange={(e) => setRoomNumberQuery(e.target.value)}
                    sx={{ minWidth: 200, bgcolor: 'white' }}
                />
                <Button disabled={!hasRoomFilters} onClick={() => { setRoomTypeFilterId("all"); setFloorFilter("all"); setRoomNumberQuery(""); }}>
                    Reset
                </Button>
            </Stack>
        </Box>
        <Divider />

        {/* TABLE */}
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell>Room Number</TableCell>
                <TableCell>Floor</TableCell>
                <TableCell>Room Type</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <Typography variant="body1" color="text.secondary">No rooms found matching your filters.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRooms.map((room, index) => {
                  const roomKey = room.id ?? `row-${index}`;
                  const isEditing = editRoomId === roomKey;
                  const canDelete = room.id !== null && room.id !== undefined;

                  return (
                    <Fragment key={roomKey}>
                      <TableRow hover>
                        <TableCell sx={{ fontWeight: 600 }}>{room.roomNumber}</TableCell>
                        <TableCell>
                             <Chip label={`Floor ${room.floor ?? '-'}`} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{room.roomTypeName}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleEditToggle(room, roomKey)} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" disabled={!canDelete} onClick={() => room.id && handleDeleteRoom(room.id)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      
                      {/* INLINE EDIT FORM */}
                      <TableRow>
                        <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                          <Collapse in={isEditing} unmountOnExit>
                            <Box sx={{ p: 3, bgcolor: 'background.default', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
                              <Typography variant="subtitle2" gutterBottom>Edit Room {room.roomNumber}</Typography>
                              <RoomCreateForm
                                formState={editRoomForm}
                                setFormState={setEditRoomForm}
                                roomTypes={roomTypes}
                                onSubmit={() => handleEditRoom(roomKey)}
                                title=""
                                submitLabel="Update Room"
                              />
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
      </Card>
    </Stack>
  );
};

export default AdminRooms;