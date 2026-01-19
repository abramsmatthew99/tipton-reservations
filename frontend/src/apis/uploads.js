import axios from "axios";
import client from "./client";

export const createUploadPresign = async ({ contentType }) => {
  const { data } = await client.post("/uploads/presign", {
    contentType,
  });

  return data;
};

export const uploadImageToPresignedUrl = async (uploadUrl, file) => {
  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
  });
};
