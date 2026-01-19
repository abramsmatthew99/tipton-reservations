// Type declarations for uploads.js module

export interface PresignResponse {
  uploadUrl?: string;
  presignedUrl?: string;
  url?: string;
  fileUrl?: string;
  publicUrl?: string;
}

export interface UploadPresignParams {
  filename?: string;
  contentType: string;
}

export function createUploadPresign(params: UploadPresignParams): Promise<PresignResponse>;

export function uploadImageToPresignedUrl(uploadUrl: string, file: File): Promise<void>;
