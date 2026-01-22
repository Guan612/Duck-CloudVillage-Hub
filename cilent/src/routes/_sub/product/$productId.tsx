import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Share2, ShoppingCart, Store, Minus, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useProductDetail } from "@/hooks/product/useProductDetail";
import { addToCartApi } from "@/http/cart";
import { createOrderApi } from "@/http/orders";

export const Route = createFileRoute("/_sub/product/$productId")({
  component: RouteComponent,
  staticData: {
    title: "产品详情",
  },
});

function RouteComponent() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const { product, loading, error } = useProductDetail(Number(productId));
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setIsAdding(true);
      await addToCartApi({ productId: product.id, quantity });
      toast.success("已成功加入购物车", {
        description: "您可以在购物车中修改数量",
        duration: 3000,
        action: {
          label: "去结算",
          onClick: () => navigate({ to: "/cart" }),
        },
      });
    } catch (error) {
      console.error("加入购物车失败:", error);
      toast.error("加入购物车失败");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    try {
      setIsBuying(true);
      await createOrderApi({ items: [{ productId: product.id, quantity }] });
      toast.success("订单创建成功");
      navigate({ to: "/cart" });
    } catch (error) {
      console.error("创建订单失败:", error);
      toast.error("创建订单失败");
    } finally {
      setIsBuying(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && product && newQuantity <= product.quantity) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">{error || "商品不存在"}</p>
          <Button onClick={() => navigate({ to: "/product" })} className="mt-4">
            返回商品列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-background">
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-50 bg-background">
        {/* 顶部导航栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-background/95 backdrop-blur-md">
          <button
            onClick={() => navigate({ to: "/product" })}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">返回</span>
          </button>
          <h1 className="text-base font-bold">商品详情</h1>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Share2 size={20} />
          </button>
        </div>

        {/* 滚动内容区 */}
        <main className="flex-1 overflow-y-auto pb-safe-or-24 scrollbar-hide">
          {/* 商品图片 */}
          <div className="aspect-square bg-muted">
            {product.imgUrl ? (
              <img
                src={product.imgUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                暂无图片
              </div>
            )}
          </div>

          {/* 商品信息 */}
          <div className="p-4 space-y-4">
            {/* 价格和标题 */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-primary">
                  {product.price}
                </span>
                <span className="text-sm text-muted-foreground">积分</span>
              </div>
              <h2 className="text-lg font-bold">{product.name}</h2>
              {product.category && (
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
              )}
            </div>

            {/* 库存信息 */}
            <div className="flex items-center justify-between py-2 border-t border-border/40">
              <span className="text-sm text-muted-foreground">库存</span>
              <span className="text-sm font-medium">{product.quantity} 件</span>
            </div>

            {/* 数量选择 */}
            <div className="flex items-center justify-between py-2 border-t border-border/40">
              <span className="text-sm text-muted-foreground">购买数量</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.quantity}
                  className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* 商品描述 */}
            {product.description && (
              <div className="py-2 border-t border-border/40">
                <h3 className="text-sm font-bold mb-2">商品描述</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </main>

        {/* 底部购买栏 */}
        <div className="border-t border-border/40 px-4 pt-3 pb-safe-offset-4 bg-background/95 backdrop-blur-md flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] z-50">
          {/* 左侧：店铺/购物车入口 */}
          <div className="flex items-center gap-4 mr-2">
            <button className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-primary transition-colors">
              <Store size={20} />
              <span className="text-[10px] font-medium">店铺</span>
            </button>
            <Link
              to="/cart"
              className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-primary transition-colors relative"
            >
              <ShoppingCart size={20} />
              <span className="text-[10px] font-medium">购物车</span>
            </Link>
          </div>

          {/* 右侧：双按钮组合 */}
          <div className="flex flex-1 gap-2">
            <Button
              variant="secondary"
              className="flex-1 rounded-full bg-secondary hover:bg-secondary/80 text-white shadow-sm font-bold"
              onClick={handleAddToCart}
              disabled={isAdding || product.quantity === 0}
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  加入中...
                </>
              ) : product.quantity === 0 ? (
                "已售罄"
              ) : (
                "加入购物车"
              )}
            </Button>

            <Button
              className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm font-bold"
              onClick={handleBuyNow}
              disabled={isBuying || product.quantity === 0}
            >
              {isBuying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  购买中...
                </>
              ) : product.quantity === 0 ? (
                "已售罄"
              ) : (
                "立即购买"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
