import { useState } from "react";

type RoomTypeFormState = {
  name: string;
  description: string;
  basePrice: string;
  maxOccupancy: string;
  imageUrl: string;
  active: string;
  amenityIds?: string[];
};

type DropdownData = {
  imageOptions: Array<{ id: string; url: string }>;
  activeOptions: Array<{ value: string; label: string }>;
};

type AmenityOption = {
  id: string | number;
  name?: string;
  iconCode?: String;
  description?: String;
};

type RoomTypeFormProps = {
  title: string;
  submitLabel: string;
  formIdPrefix: string;
  formState: RoomTypeFormState;
  setFormState: (nextState: RoomTypeFormState) => void;
  dropdownData: DropdownData;
  amenitiesOptions?: AmenityOption[];
  onSubmit: () => void;
};

function RoomTypeForm({
  title,
  submitLabel,
  formIdPrefix,
  formState,
  setFormState,
  dropdownData,
  amenitiesOptions,
  onSubmit,
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
      <h2>{title}</h2>

      <label htmlFor={`${formIdPrefix}-name`}>Name</label>
      <input
        id={`${formIdPrefix}-name`}
        type="text"
        value={formState.name}
        onChange={(event) =>
          setFormState({ ...formState, name: event.target.value })
        }
      />

      <label htmlFor={`${formIdPrefix}-description`}>Description</label>
      <textarea
        id={`${formIdPrefix}-description`}
        rows={3}
        value={formState.description}
        onChange={(event) =>
          setFormState({ ...formState, description: event.target.value })
        }
      />

      <div className="grid">
        <div>
          <label htmlFor={`${formIdPrefix}-base-price`}>Base Price</label>
          <input
            id={`${formIdPrefix}-base-price`}
            type="number"
            step="0.01"
            value={formState.basePrice}
            onChange={(event) =>
              setFormState({ ...formState, basePrice: event.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor={`${formIdPrefix}-max-occupancy`}>Max Occupancy</label>
          <select
            id={`${formIdPrefix}-max-occupancy`}
            value={formState.maxOccupancy}
            onChange={(event) =>
              setFormState({ ...formState, maxOccupancy: event.target.value })
            }
          >
            {Array.from({ length: 12 }, (_, index) => {
              const value = String(index + 1);
              return (
                <option key={value} value={value}>
                  {value}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <label htmlFor={`${formIdPrefix}-image-url`}>Image Url</label>
      <select
        id={`${formIdPrefix}-image-url`}
        value={formState.imageUrl}
        onChange={(event) =>
          setFormState({ ...formState, imageUrl: event.target.value })
        }
      >
        {dropdownData.imageOptions.map((option) => (
          <option key={option.id} value={option.url}>
            {option.url}
          </option>
        ))}
      </select>

      <label htmlFor={`${formIdPrefix}-active`}>Active</label>
      <select
        id={`${formIdPrefix}-active`}
        value={formState.active}
        onChange={(event) =>
          setFormState({ ...formState, active: event.target.value })
        }
      >
        {dropdownData.activeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {amenitiesOptions && amenitiesOptions.length > 0 && (
        <>
          <label htmlFor={`${formIdPrefix}-amenities`}>Amenities</label>
          <select
            id={`${formIdPrefix}-amenities`}
            value={amenitySelectValue}
            onChange={(event) => {
              const nextId = event.target.value;
              setAmenitySelectValue("");
              if (!nextId) return;
              if (selectedAmenityIds.includes(nextId)) return;
              setFormState({
                ...formState,
                amenityIds: [...selectedAmenityIds, nextId],
              });
            }}
          >
            <option value="">Select an amenity</option>
            {amenitiesOptions.map((amenity) => (
              <option key={amenity.id} value={String(amenity.id)}>
                {amenity.name ?? `Amenity ${amenity.id}`}
              </option>
            ))}
          </select>

          {selectedAmenityIds.length > 0 && (
            <div className="selected-amenities">
              Selected:{" "}
              {selectedAmenityIds
                .map((id) => {
                  const match = amenitiesOptions.find(
                    (amenity) => String(amenity.id) === id
                  );
                  return match?.name ?? id;
                })
                .join(", ")}
            </div>
          )}
        </>
      )}

      <button type="submit">{submitLabel}</button>
    </form>
  );
}

export default RoomTypeForm;
