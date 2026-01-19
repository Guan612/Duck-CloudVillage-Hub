import { http } from ".";

export const getProductApi = () => {
  return http.get("/product");
};
