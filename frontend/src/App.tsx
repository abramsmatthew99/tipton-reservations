import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import RoomTypeForm from "./components/RoomTypeForm";
import RoomCreateForm from "./components/RoomCreateForm";
import { createRoomType, getRoomTypes } from "./apis/roomtype";
import { createRoom } from "./apis/room";
import { getAmenities } from "./apis/amenities";
import BookingConfirmPage from "./pages/BookingConfirmPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";

function App() {
  const dropdownData = {
    imageOptions: [
      { id: "img-1", url: "https://example.com/rooms/standard-1.jpg" },
      { id: "img-2", url: "https://example.com/rooms/deluxe-1.jpg" },
      { id: "img-3", url: "https://example.com/rooms/suite-1.jpg" },
    ],
    activeOptions: [
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
  };

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    maxOccupancy: "",
    imageUrl: dropdownData.imageOptions[0].url,
    active: "true",
    amenityIds: [],
  });

  const [createRoomForm, setCreateRoomForm] = useState({
    roomTypeId: "",
    roomNumber: "",
    floor: "",
    status: "active",
  });

  const [editForm, setEditForm] = useState({
    name: "Deluxe King",
    description: "Spacious room with a king bed and city view.",
    basePrice: "189.00",
    maxOccupancy: "3",
    imageUrl: dropdownData.imageOptions[1].url,
    active: "true",
  });

  const [amenities, setAmenities] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);

  const handleSubmit = async (label: string) => {
    const formData = label === "create" ? createForm : editForm;
    const res = await createRoomType(formData);
    console.log(res);
  };

  const handleCreateRoom = async () => {
    const payload = {
      ...createRoomForm,
      floor: createRoomForm.floor === "" ? null : Number(createRoomForm.floor),
    };
    const res = await createRoom(payload);
    console.log(res);
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

  useEffect(() => {
    if (roomTypes.length === 0) return;
    setCreateRoomForm((prev) =>
      prev.roomTypeId ? prev : { ...prev, roomTypeId: String(roomTypes[0].id) }
    );
  }, [roomTypes]);

  return (
    <Routes>
      {/* Landing page - placeholder for now */}
      <Route
        path='/'
        element={
          <div className='app'>
            <header>
              <h1>Tipton Hotel Reservations</h1>
              <p>Landing page...</p>
            </header>
          </div>
        }
      />

      {/* Booking Confirmation Page (Payment) */}
      <Route path='/booking/confirm' element={<BookingConfirmPage />} />

      {/* Booking Confirmation Success Page */}
      <Route path='/booking/confirmation/:confirmationNumber' element={<BookingConfirmationPage />} />

      {/* Admin route for existing room management forms */}
      <Route
        path='/admin'
        element={
          <div className='app'>
            <header>
              <h1>Room Type Forms</h1>
              <p>Basic forms for the RoomType model (dummy data only).</p>
            </header>

            <div className='forms'>
              <RoomTypeForm
                title='Create Room Type'
                submitLabel='Save'
                formIdPrefix='create'
                formState={createForm}
                setFormState={setCreateForm}
                dropdownData={dropdownData}
                amenitiesOptions={amenities}
                onSubmit={() => handleSubmit("create")}
              />
              <RoomTypeForm
                title='Edit Room Type'
                submitLabel='Update'
                formIdPrefix='edit'
                formState={editForm}
                setFormState={setEditForm}
                dropdownData={dropdownData}
                onSubmit={() => handleSubmit("edit")}
              />
              <RoomCreateForm
                formState={createRoomForm}
                setFormState={setCreateRoomForm}
                roomTypes={roomTypes}
                onSubmit={handleCreateRoom}
              />
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
