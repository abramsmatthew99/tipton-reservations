export type Amenity = {
  id: string | number;
  name?: string;
  iconCode?: string;
  description?: string;
};

export function getAmenities(): Promise<Amenity[]>;
