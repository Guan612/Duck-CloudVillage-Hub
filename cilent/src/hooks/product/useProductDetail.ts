import { useState, useEffect } from "react";
import { getProductDetailApi } from "@/http/product";
import type { Product } from "@/types/api-responses";
import { useNavigate } from "@tanstack/react-router";
import { createOrderApi } from "@/http/orders";
import { toast } from "sonner";
import { addToCartApi } from "@/http/cart";

export function useProductDetail(productId: number) {
  const navigate = useNavigate();
  
  // 核心数据状态
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 交互状态 (数量、加载中状态)
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  // 获取详情
  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProductDetailApi(productId);
      if (res && res.code === 0 && res.data) {
        setProduct(res.data);
        // 重置数量为 1 (当切换商品ID时很有用)
        setQuantity(1);
      }
    } catch (err) {
      console.error("获取商品详情失败:", err);
      setError("获取商品详情失败");
    } finally {
      setLoading(false);
    }
  };

  // 数量变更逻辑
  const updateQuantity = (delta: number) => {
    if (!product) return;
    const newQuantity = quantity + delta;
    // 确保在 1 和库存之间
    if (newQuantity >= 1 && newQuantity <= product.quantity) {
      setQuantity(newQuantity);
    }
  };

  // 加入购物车逻辑
  const addToCart = async () => {
    if (!product) return;

    try {
      setIsAdding(true);
      const res = await addToCartApi({ productId: product.id, quantity });
      if (res.code == 0) {
        toast.success("已成功加入购物车", {
          description: "您可以在购物车中修改数量",
          duration: 3000,
          action: {
            label: "去结算",
            onClick: () => navigate({ to: "/cart" }),
          },
        });
      }
    } catch (error) {
      console.error("加入购物车失败:", error);
      toast.error("加入购物车失败");
    } finally {
      setIsAdding(false);
    }
  };

  // 立即购买逻辑
  const buyNow = async () => {
    if (!product) return;

    try {
      setIsBuying(true);
      const res =  await createOrderApi({ items: [{ productId: product.id, quantity }] });
      toast.success("订单创建成功");
      // 根据你的业务逻辑跳转，通常是去订单列表或支付页，这里保持原样去 cart
      navigate({ to: "/order" }); 
    } catch (error) {
      console.error("创建订单失败:", error);
      toast.error("创建订单失败");
    } finally {
      setIsBuying(false);
    }
  };

  // 初始化获取数据
  useEffect(() => {
    if (productId) {
      fetchProductDetail();
    }
  }, [productId]);

  return {
    product,
    loading,
    error,
    quantity,
    isAdding,
    isBuying,
    updateQuantity, // 暴露修改数量的方法
    addToCart,      // 暴露加入购物车方法
    buyNow,         // 暴露立即购买方法
    refresh: fetchProductDetail, // 可选：暴露刷新方法
  };
}
