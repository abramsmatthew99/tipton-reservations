export type AmenityIconName = //can be exactly one of these things and nothing else

    | "AcUnit"
    | "Accessible"
    | "Balcony"
    | "Cable"
    | "Coffee"
    | "Curtains"
    | "Desk"
    | "Dryer"
    | "Iron"
    | "Kitchen"
    | "Lock"
    | "LocationCity"
    | "Microwave"
    | "Pets"
    | "SmokeFree"
    | "Tv"
    | "Water"
    | "Whatshot"
    | "Wifi";

const amenityIconMap: Record<string, AmenityIconName> = {
  //record <K, V>
  ac: "AcUnit",
  fridge: "Kitchen",
  heat: "Whatshot",
  cable: "Cable",
  coffee: "Coffee",
  microwave: "Microwave",
  safe: "Lock",
  tv: "Tv",
  wifi: "Wifi",
  balcony: "Balcony",
  ocean: "Water",
  city: "LocationCity",
  desk: "Desk",
  curtains: "Curtains",
  dryer: "Dryer",
  iron: "Iron",
  accessible: "Accessible",
  pet: "Pets",
  nosmoking: "SmokeFree",
};

export const resolveAmenityIconName = (
  iconCode?: string | null
): AmenityIconName | null => {
  if (!iconCode) return null;
  const key = iconCode;
  return amenityIconMap[key] ?? null;
};

export default amenityIconMap;
