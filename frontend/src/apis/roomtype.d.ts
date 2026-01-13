export type RoomType = {
  id?: string | number;
  name: string;
  description?: string;
  basePrice?: string | number;
  maxOccupancy?: string | number;
  imageUrl?: string;
  imageUrls?: string[];
  amenityIds?: Array<string | number>;
};

export type RoomTypeFormData = {
  name?: string;
  description?: string;
  basePrice?: string | number | null;
  maxOccupancy?: string | number | null;
  imageUrl?: string;
  amenityIds?: string[];
  roomId?: string | number;
};

export function createRoomType(formData: RoomTypeFormData): Promise<RoomType>;
export function getRoomTypes(): Promise<RoomType[]>;
export function deleteRoomType(id: string | number): Promise<any>;
export function getRoomTypesByDateAndGuests(
  checkInDate: string,
  checkOutDate: string,
  guests: number
): Promise<RoomType[]>;
export function editRoomType(formData: RoomTypeFormData): Promise<RoomType>;
