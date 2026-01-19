import { http } from ".";

export const loginApi = (data) => {
  return http.post("/auth/login", data);
};

export const registerApi = (data) => {
  return http.post("/auth/register", data);
};
