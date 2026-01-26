import { deleteCartItemApi, getCartApi } from "@/http/cart";
import { createOrderApi } from "@/http/orders";
import { CartItem, Product } from "@/types/api-responses";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function useMyCart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 辅助函数：格式化金额
  const formatPrice = (price: number) => `¥${price.toFixed(2)}`;

  const getCartlist = async () => {
    const res = await getCartApi();
    if (res.code == 0) {
      setCartItems(res.data || []);
    }
  };

  // ------------------- 交互逻辑 -------------------

  // 切换选中状态
  const toggleCheck = (id: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  // 全选/全不选
  const toggleAll = () => {
    const isAllChecked = cartItems.every((item) => !!item.checked);
    setCartItems((prev) =>
      prev.map((item) => ({ ...item, checked: !isAllChecked })),
    );
  };

  // 修改数量 (带库存检查)
  const updateQuantity = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          // 限制：不能小于1，且不能超过库存(product.quantity)
          if (newQty < 1) return item;
          if (newQty > item.product.quantity) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  // 删除商品
  const removeItem = async (id: number) => {
    const res = await deleteCartItemApi(id);
    if (res.code == 0) {
      toast.success("删除产品成功");
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      getCartlist();
    }
  };

  const total = cartItems
    .filter((item) => !!item.checked)
    .reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  const selectedCount = cartItems.filter((item) => !!item.checked).length;
  const isAllChecked =
    cartItems.length > 0 && cartItems.every((item) => !!item.checked);

  const handleCheckout = async () => {
    // 1. 筛选出被选中的商品 (item.checked === true)
    const selectedItems = cartItems.filter((item) => item.checked);

    if (selectedItems.length === 0) {
      toast.error("请先选择要结算的商品");
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. 转换为后端需要的格式 { items: [...] }
      const payload = {
        items: selectedItems.map((item) => ({
          productId: item.productId, // 注意：这里取 item 上的 productId
          quantity: item.quantity,
        })),
      };

      // 3. 发起请求
      const res = await createOrderApi(payload);

      if (res.code === 0) {
        toast.success("订单创建成功");

        // 4. 成功后的处理：
        // A. 这里通常需要重新请求购物车列表，把已购买的商品从购物车清除
        //    (注意：你的后端 createOrderRoute 目前没有删除购物车数据的逻辑，
        //    建议后端加一个步骤：创建订单后 delete from carts where userId = ? and productId in (...))

        // B. 跳转到订单详情页或支付页 (假设路由是 /orders/$orderId)
        await navigate({ to: `/order/${res.data.id}` });
      } else {
        toast.error(res.msg || "结算失败");
      }
    } catch (error) {
      console.error(error);
      toast.error("网络异常，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    getCartlist();
  }, []);

  return {
    cartItems,
    selectedCount,
    isAllChecked,
    total,
    setCartItems,
    formatPrice,
    toggleCheck,
    toggleAll,
    updateQuantity,
    removeItem,
    handleCheckout,
  };
}
