import { getProductApi } from "@/http/product";
import { useEffect, useState } from "react";
import type { Product } from "@/types/api-responses";

export default function useProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProductApi();
      setProducts(res.data || []);
    } catch (err) {
      setError("获取商品列表失败");
      console.error("获取商品列表失败:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return {
    products,
    loading,
    error,
    getProducts,
  };
}
