type RoomCreateFormState = {
  roomTypeId: string;
  roomNumber: string;
  floor: string;
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
  title?: string;
  submitLabel?: string;
};

function RoomCreateForm({
  formState,
  setFormState,
  roomTypes,
  onSubmit,
  title = "Create Room",
  submitLabel = "Create Room",
}: RoomCreateFormProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <h2>{title}</h2>

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
      </div>

      <button type="submit">{submitLabel}</button>
    </form>
  );
}

export default RoomCreateForm;
