import { getProductApi } from "@/http/product";
import { useEffect, useState } from "react";

export default function useProduct() {
  const [prosucts, setProducts] = useState();

  const getProsucts = async () => {
    const res = await getProductApi();
    setProducts(res.data);
  };

  useEffect(() => {
    getProsucts();
  }, []);

  return {
    prosucts,
    setProducts,
    getProsucts,
  };
}
