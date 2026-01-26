import { http } from ".";
import type { UploadResponse } from "@/types/api-responses";

// 通用文件上传
export const uploadApi = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return http.post<UploadResponse>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
