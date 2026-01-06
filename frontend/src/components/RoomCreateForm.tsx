type RoomCreateFormState = {
  roomTypeId: string;
  roomNumber: string;
  floor: string;
  status: string;
};

type RoomTypeOption = {
  id: string | number;
  name: string;
};

type RoomCreateFormProps = {
  formState: RoomCreateFormState;
  setFormState: (nextState: RoomCreateFormState) => void;
  roomTypes: RoomTypeOption[];
  onSubmit: () => void;
};

function RoomCreateForm({
  formState,
  setFormState,
  roomTypes,
  onSubmit,
}: RoomCreateFormProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <h2>Create Room</h2>

      <label htmlFor="room-type-id">Room Type</label>
      <select
        id="room-type-id"
        value={formState.roomTypeId}
        onChange={(event) =>
          setFormState({ ...formState, roomTypeId: event.target.value })
        }
      >
        {roomTypes.length === 0 && (
          <option value="">No room types found</option>
        )}
        {roomTypes.map((roomType) => (
          <option key={roomType.id} value={String(roomType.id)}>
            {roomType.name}
          </option>
        ))}
      </select>

      <label htmlFor="room-number">Room Number</label>
      <input
        id="room-number"
        type="text"
        value={formState.roomNumber}
        onChange={(event) =>
          setFormState({ ...formState, roomNumber: event.target.value })
        }
      />

      <div className="grid">
        <div>
          <label htmlFor="room-floor">Floor</label>
          <input
            id="room-floor"
            type="number"
            value={formState.floor}
            onChange={(event) =>
              setFormState({ ...formState, floor: event.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor="room-status">Status</label>
          <select
            id="room-status"
            value={formState.status}
            onChange={(event) =>
              setFormState({ ...formState, status: event.target.value })
            }
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="OCCUPIED">OCCUPIED</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </select>
        </div>
      </div>

      <button type="submit">Create Room</button>
    </form>
  );
}

export default RoomCreateForm;
