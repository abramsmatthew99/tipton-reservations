import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import RoomCreateForm from "../../components/RoomCreateForm";
import { getRoomTypes } from "../../apis/roomtype";
import { createRoom, getRooms, editRoom, deleteRoom } from "../../apis/room";
import {
  Box,
  Button,
  Collapse,
  Divider,
  MenuItem,
  Paper,
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

type RoomTypeOption = {
  id: string | number;
  name: string;
};

type Room = {
  id?: string | number;
  floor: number | string | null;
  roomNumber: string | number;
  roomTypeId: string | number;
  roomTypeName?: string;
};

const AdminRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [editRoomId, setEditRoomId] = useState<string | number | null>(null);
  const [roomTypeFilterId, setRoomTypeFilterId] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [roomNumberQuery, setRoomNumberQuery] = useState("");

  const [createRoomForm, setCreateRoomForm] = useState({
    roomTypeId: "",
    roomNumber: "",
    floor: "",
  });
  const [editRoomForm, setEditRoomForm] = useState({
    roomTypeId: "",
    roomNumber: "",
    floor: "",
  });
  const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>([]);
  const roomTypeById = useMemo(() => {
    const lookup = new Map<string, string>();
    roomTypes.forEach((roomType) => {
      lookup.set(String(roomType.id), roomType.name);
    });
    return lookup;
  }, [roomTypes]);
  const availableFloors = useMemo(() => {
    const floors = Array.from(
      new Set(
        rooms
          .map((room) => room.floor)
          .filter((floor) => floor !== null && floor !== undefined)
          .map((floor) => String(floor))
      )
    );
    return floors.sort((a, b) => Number.parseFloat(a) - Number.parseFloat(b));
  }, [rooms]);
  const filteredRooms = useMemo(() => {
    const query = roomNumberQuery.trim().toLowerCase();
    return rooms.filter((room) => {
      if (
        roomTypeFilterId !== "all" &&
        String(room.roomTypeId) !== roomTypeFilterId
      ) {
        return false;
      }
      if (floorFilter !== "all" && String(room.floor ?? "") !== floorFilter) {
        return false;
      }
      if (
        query &&
        !String(room.roomNumber ?? "")
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [rooms, roomTypeFilterId, floorFilter, roomNumberQuery]);
  const hasRoomFilters =
    roomTypeFilterId !== "all" ||
    floorFilter !== "all" ||
    roomNumberQuery.trim() !== "";
  const attachRoomTypeName = useCallback(
    (room: Room) => ({
      ...room,
      roomTypeName: roomTypeById.get(String(room.roomTypeId)) ?? "-",
    }),
    [roomTypeById]
  );

  const handleEditRoom = async (roomId: string | number) => {
    const payload = {
      roomId,
      ...editRoomForm,
      floor: editRoomForm.floor === "" ? null : Number(editRoomForm.floor),
    };
    const res = await editRoom(payload);
    setRooms((prev) => {
      if (Array.isArray(res)) {
        return res.map(attachRoomTypeName);
      }
      if (!res) {
        return prev;
      }
      return prev.map((room) =>
        room.id === roomId ? attachRoomTypeName({ ...room, ...res }) : room
      );
    });
    setEditRoomId(null);
  };

  const handleCreateRoom = async () => {
    const payload = {
      ...createRoomForm,
      floor: createRoomForm.floor === "" ? null : Number(createRoomForm.floor),
    };
    const res = await createRoom(payload);
    setRooms((prev) => {
      const nextRooms = Array.isArray(res) ? res : [...prev, res];
      return nextRooms.map(attachRoomTypeName);
    });
  };
  const handleDeleteRoom = async (roomId: string | number) => {
    const confirmed = window.confirm(
      "Delete this room? This action cannot be undone."
    );
    if (!confirmed) {
      return;
    }
    const res = await deleteRoom(roomId);
    setRooms((prev) => {
      if (Array.isArray(res)) {
        return res.map(attachRoomTypeName);
      }
      return prev.filter((room) => room.id !== roomId);
    });
    if (editRoomId === roomId) {
      setEditRoomId(null);
    }
  };

  const handleEditToggle = (room: Room, roomKey: string | number) => {
    if (editRoomId === roomKey) {
      setEditRoomId(null);
      return;
    }

    setEditRoomId(roomKey);
    setEditRoomForm({
      roomTypeId: String(room.roomTypeId ?? roomTypes[0]?.id ?? ""),
      roomNumber: room.roomNumber ? String(room.roomNumber) : "",
      floor:
        room.floor === null || room.floor === undefined
          ? ""
          : String(room.floor),
    });
  };
  useEffect(() => {
    const getStuff = async () => {
      const [roomTypesRes, roomRes] = await Promise.all([
        getRoomTypes(),
        getRooms(),
      ]);
      const roomTypeLookup = new Map<string, string>(
        roomTypesRes.map((roomType) => [String(roomType.id), roomType.name])
      );
      setRoomTypes(roomTypesRes);
      setRooms(
        roomRes.map((room) => ({
          ...room,
          roomTypeName: roomTypeLookup.get(String(room.roomTypeId)) ?? "-",
        }))
      );
    };
    getStuff();
  }, []);

  useEffect(() => {
    if (roomTypes.length === 0) return;
    setCreateRoomForm((prev) =>
      prev.roomTypeId ? prev : { ...prev, roomTypeId: String(roomTypes[0].id) }
    );
  }, [roomTypes, rooms]);

  useEffect(() => {
    if (roomTypes.length === 0) return;
    setRooms((prev) => prev.map(attachRoomTypeName));
  }, [roomTypes, attachRoomTypeName]);
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
                Create Room
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add a room number, assign a type.
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => setShowCreateRoom((prev) => !prev)}
            >
              {showCreateRoom ? "Hide Form" : "Add Room"}
            </Button>
          </Box>
          <Collapse in={showCreateRoom}>
            <RoomCreateForm
              formState={createRoomForm}
              setFormState={setCreateRoomForm}
              roomTypes={roomTypes}
              onSubmit={handleCreateRoom}
            />
          </Collapse>
        </Stack>
      </Paper>

      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Existing Rooms
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review inventory across floors and room types.
            </Typography>
          </Box>
          <Divider />
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              select
              size="small"
              label="Room Type"
              value={roomTypeFilterId}
              onChange={(event) => setRoomTypeFilterId(event.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">All room types</MenuItem>
              {roomTypes.map((roomType) => (
                <MenuItem key={roomType.id} value={String(roomType.id)}>
                  {roomType.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Floor"
              value={floorFilter}
              onChange={(event) => setFloorFilter(event.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="all">All floors</MenuItem>
              {availableFloors.map((floor) => (
                <MenuItem key={floor} value={floor}>
                  {floor}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Room Number"
              placeholder="Search room number"
              value={roomNumberQuery}
              onChange={(event) => setRoomNumberQuery(event.target.value)}
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="text"
              disabled={!hasRoomFilters}
              onClick={() => {
                setRoomTypeFilterId("all");
                setFloorFilter("all");
                setRoomNumberQuery("");
              }}
            >
              Clear
            </Button>
          </Stack>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Floor</TableCell>
                  <TableCell>Room Number</TableCell>
                  <TableCell>Room Type</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="body2" color="text.secondary">
                        {rooms.length === 0
                          ? "No rooms found."
                          : "No rooms match the current filters."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map((room, index) => {
                    const roomKey = room.id ?? `row-${index}`;
                    const isEditing = editRoomId === roomKey;
                    const canDelete = room.id !== null && room.id !== undefined;

                    return (
                      <Fragment key={roomKey}>
                        <TableRow key={roomKey} hover>
                          <TableCell>{room.floor ?? "-"}</TableCell>
                          <TableCell>{room.roomNumber}</TableCell>
                          <TableCell>{room.roomTypeName ?? "-"}</TableCell>
                          <TableCell align="right">
                            <Stack
                              direction="row"
                              spacing={1}
                              justifyContent="flex-end"
                            >
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleEditToggle(room, roomKey)}
                              >
                                {isEditing ? "Cancel" : "Edit"}
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                disabled={!canDelete}
                                onClick={() =>
                                  room.id !== undefined &&
                                  room.id !== null &&
                                  handleDeleteRoom(room.id)
                                }
                              >
                                Delete
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                        <TableRow key={`${roomKey}-edit`}>
                          <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                            <Collapse in={isEditing} unmountOnExit>
                              <Box sx={{ p: 2 }}>
                                <RoomCreateForm
                                  formState={editRoomForm}
                                  setFormState={setEditRoomForm}
                                  roomTypes={roomTypes}
                                  onSubmit={() => handleEditRoom(roomKey)}
                                  title="Edit Room"
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
        </Stack>
      </Paper>
    </Stack>
    // <div className="forms">
    //   <RoomTypeForm
    //     title="Create Room Type"
    //     submitLabel="Save"
    //     formIdPrefix="create"
    //     formState={createForm}
    //     setFormState={setCreateForm}
    //     dropdownData={dropdownData}
    //     amenitiesOptions={amenities}
    //     onSubmit={() => handleSubmit("create")}
    //   />
    //   <RoomTypeForm
    //     title="Edit Room Type"
    //     submitLabel="Update"
    //     formIdPrefix="edit"
    //     formState={editForm}
    //     setFormState={setEditForm}
    //     dropdownData={dropdownData}
    //     onSubmit={() => handleSubmit("edit")}
    //   />
    //   <RoomCreateForm
    //     formState={createRoomForm}
    //     setFormState={setCreateRoomForm}
    //     roomTypes={roomTypes}
    //     onSubmit={handleCreateRoom}
    //   />
    // </div>
  );
};

export default AdminRooms;
