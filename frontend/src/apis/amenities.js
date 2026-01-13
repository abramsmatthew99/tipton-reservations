import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const getAmenities = async () => {
  const { data } = await axios.get(
    `${baseURL}/amenities`
    // headers: {
    //     Authorization: `Bearer ${token}`
    // }
  );

  return data;
};
