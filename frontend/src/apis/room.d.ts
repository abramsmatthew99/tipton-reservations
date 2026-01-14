export type Room = {
  id?: string | number;
  roomNumber?: string | number;
  roomTypeId?: string | number;
  status?: string;
  floor?: number | string | null;
  roomTypeName?: string;
};

export type RoomFormData = {
  roomNumber?: string | number;
  roomTypeId?: string | number;
  status?: string;
  floor?: number | string | null;
  roomId?: string | number;
};

export function createRoom(formData: RoomFormData): Promise<Room>;
export function getRooms(): Promise<Room[]>;
export function setRoomStatus(status: string, id: string | number): Promise<Room>;
export function editRoom(formData: RoomFormData): Promise<Room>;
export function deleteRoom(id: string | number): Promise<any>;
