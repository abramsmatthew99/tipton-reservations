import { Fragment, useEffect, useState } from "react";
import RoomCreateForm from "../../components/RoomCreateForm";
import { getRoomTypes } from "../../apis/roomtype";
import { createRoom, getRooms, editRoom } from "../../apis/room";
import {
  Box,
  Button,
  Collapse,
  Divider,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
};

const AdminRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [editRoomId, setEditRoomId] = useState<string | number | null>(null);

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
  const handleEditRoom = async (roomId: string | number) => {
    const payload = {
      roomId,
      ...editRoomForm,
      floor: editRoomForm.floor === "" ? null : Number(editRoomForm.floor),
    };
    const res = await editRoom(payload);
    setRooms((prev) => {
      if (Array.isArray(res)) {
        return res;
      }
      if (!res) {
        return prev;
      }
      return prev.map((room) => (room.id === roomId ? { ...room, ...res } : room));
    });
    setEditRoomId(null);
  };

  const handleCreateRoom = async () => {
    const payload = {
      ...createRoomForm,
      floor: createRoomForm.floor === "" ? null : Number(createRoomForm.floor),
    };
    const res = await createRoom(payload);
    setRooms((prev) => (Array.isArray(res) ? res : [...prev, res]));
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
      setRoomTypes(roomTypesRes);
      setRooms(roomRes);
    };
    getStuff();
  }, []);

  useEffect(() => {
    if (roomTypes.length === 0) return;
    setCreateRoomForm((prev) =>
      prev.roomTypeId ? prev : { ...prev, roomTypeId: String(roomTypes[0].id) }
    );
  }, [roomTypes, rooms]);
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
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Floor</TableCell>
                  <TableCell>Room Number</TableCell>
                  <TableCell>Room Type ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="body2" color="text.secondary">
                        No rooms found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rooms.map((room, index) => {
                    const roomKey = room.id ?? `row-${index}`;
                    const isEditing = editRoomId === roomKey;

                    return (
                      <Fragment key={roomKey}>
                        <TableRow key={roomKey} hover>
                          <TableCell>{room.floor ?? "-"}</TableCell>
                          <TableCell>{room.roomNumber}</TableCell>
                          <TableCell>{room.roomTypeId}</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleEditToggle(room, roomKey)}
                            >
                              {isEditing ? "Cancel" : "Edit"}
                            </Button>
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
