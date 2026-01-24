import { LoginParams, RegisterParams } from "@/types/api-reqest";
import { http } from ".";
import { LoginResponse, RegisterResponse } from "@/types/api-responses";

export const loginApi = (data: LoginParams) => {
  return http.post<RegisterResponse>("/auth/login", data);
};

export const registerApi = (data: RegisterParams) => {
  return http.post<LoginResponse>("/auth/register", data);
};
