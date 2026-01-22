import { useState, useEffect } from "react";
import { getProductDetailApi } from "@/http/product";
import type { ApiResponse } from "@/types/api";
import type { Product } from "@/types/api-responses";

export function useProductDetail(productId: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProductDetailApi(productId);
      if (res && res.code === 0 && res.data) {
        setProduct(res.data);
      }
    } catch (err) {
      console.error("获取商品详情失败:", err);
      setError("获取商品详情失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetail();
  }, [productId]);

  return { product, loading, error, refetch: fetchProductDetail };
}
