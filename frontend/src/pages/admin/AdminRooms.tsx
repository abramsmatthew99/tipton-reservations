import { useEffect, useState } from "react";
import RoomCreateForm from "../../components/RoomCreateForm";
import { getRoomTypes } from "../../apis/roomtype";
import { createRoom, getRooms } from "../../apis/room";
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
import { setRoomStatus } from "../../apis/room";

type RoomTypeOption = {
  id: string | number;
  name: string;
};

type Room = {
  id?: string | number;
  floor: number | string | null;
  roomNumber: string | number;
  roomTypeId: string | number;
  status: string;
};

const ROOM_STATUS_OPTIONS = ["AVAILABLE", "OCCUPIED", "MAINTENANCE"] as const;

const AdminRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  const [createRoomForm, setCreateRoomForm] = useState({
    roomTypeId: "",
    roomNumber: "",
    floor: "",
    status: "AVAILABLE",
  });
  const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>([]);

  const handleCreateRoom = async () => {
    const payload = {
      ...createRoomForm,
      floor: createRoomForm.floor === "" ? null : Number(createRoomForm.floor),
    };
    const res = await createRoom(payload);
    setRooms((prev) => (Array.isArray(res) ? res : [...prev, res]));
  };
  const handleStatusChange = async (id: string | number, status: string) => {
    await setRoomStatus(status, id);
    setRooms((prev) =>
      prev.map((room) =>
        room.id === id
          ? {
              ...room,
              status,
            }
          : room
      )
    );
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
                Add a room number, assign a type, and set status.
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
                  <TableCell>Status</TableCell>
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
                  rooms.map((room, index) => (
                    <TableRow key={room.id ?? index} hover>
                      <TableCell>{room.floor ?? "-"}</TableCell>
                      <TableCell>{room.roomNumber}</TableCell>
                      <TableCell>{room.roomTypeId}</TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={room.status}
                          disabled={room.id == null}
                          onChange={(event) => {
                            if (room.id == null) return;
                            handleStatusChange(
                              room.id,
                              String(event.target.value)
                            );
                          }}
                        >
                          {ROOM_STATUS_OPTIONS.map((statusOption) => (
                            <MenuItem key={statusOption} value={statusOption}>
                              {statusOption}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
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
