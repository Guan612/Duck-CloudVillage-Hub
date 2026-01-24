import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ShoppingCart,
  Store,
  Minus,
  Plus,
  Loader2,
  PackageX,
  ImageIcon,
} from "lucide-react";
import { useProductDetail } from "@/hooks/product/useProductDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_sub/product/$productId")({
  component: RouteComponent,
  staticData: {
    title: "产品详情",
  },
});

function RouteComponent() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();

  // 核心：直接从 Hook 中解构所有需要的状态和方法
  const {
    product,
    loading,
    error,
    quantity,
    isAdding,
    isBuying,
    updateQuantity,
    addToCart,
    buyNow,
  } = useProductDetail(Number(productId));

  // Loading 状态渲染
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error 或 空数据渲染
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

  // 正常渲染
  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* 主内容区：使用 ScrollArea 替换原生 overflow-y-auto 
        注意：ScrollArea 需要确定的高度，这里通过 flex-1 让其自动填充
      */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col space-y-4">
          {/* 1. 商品图片区域 */}
          <div className="relative aspect-square w-full bg-muted/50">
            {product.imgUrl ? (
              <img
                src={product.imgUrl}
                alt={product.name}
                className="h-full w-full object-cover rounded-xl"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center space-y-2 text-muted-foreground/50">
                <ImageIcon size={48} strokeWidth={1.5} />
                <span className="text-sm">暂无图片</span>
              </div>
            )}

            {/* 售罄遮罩 (可选) */}
            {product.quantity === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                <div className="flex flex-col items-center text-muted-foreground">
                  <PackageX size={48} />
                  <span className="mt-2 font-bold">已售罄</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. 商品信息卡片 */}
          <div className="px-4">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="p-0 space-y-2">
                {/* 价格与标签 */}
                <div className="flex items-start justify-between">
                  <div className="flex items-baseline gap-1.5 text-primary">
                    <span className="text-3xl font-bold tracking-tight">
                      {product.price}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      积分
                    </span>
                  </div>
                  {product.category && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {product.category}
                    </Badge>
                  )}
                </div>

                {/* 标题 */}
                <CardTitle className="text-xl leading-snug">
                  {product.name}
                </CardTitle>

                {/* 简单描述/副标题 (如果有) */}
                {/* <CardDescription>这里可以放简短的促销信息</CardDescription> */}
              </CardHeader>

              <CardContent className="p-0 mt-6 space-y-6">
                {/* 库存与数量选择组 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">剩余库存</span>
                    <span className="font-mono font-medium">
                      {product.quantity} 件
                    </span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">购买数量</span>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full shrink-0"
                        onClick={() => updateQuantity(-1)}
                        disabled={quantity <= 1}
                      >
                        <Minus size={14} />
                      </Button>

                      <span className="w-8 text-center font-mono text-lg font-medium">
                        {quantity}
                      </span>

                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full shrink-0"
                        onClick={() => updateQuantity(1)}
                        disabled={quantity >= product.quantity}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 商品详情描述 */}
                {product.description && (
                  <div className="pt-2 space-y-3">
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        商品详情
                      </h3>
                      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap text-justify">
                        {product.description}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 3. 底部固定操作栏 
        使用 backdrop-blur 增加现代感
      */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center gap-4 px-4 py-3 max-w-md mx-auto">
          {/* 左侧导航组 */}
          <div className="flex items-center gap-5 mr-2">
            <Button
              variant="ghost"
              size="icon"
              className="flex-col h-auto gap-0.5 hover:bg-transparent text-muted-foreground hover:text-primary px-0"
            >
              <Store size={22} strokeWidth={1.5} />
              <span className="text-[10px]">店铺</span>
            </Button>

            <Link to="/cart" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="flex-col h-auto gap-0.5 hover:bg-transparent text-muted-foreground hover:text-primary px-0"
              >
                <ShoppingCart size={22} strokeWidth={1.5} />
                <span className="text-[10px]">购物车</span>
              </Button>
              {/* 这里可以加一个购物车数量的小红点 badge */}
            </Link>
          </div>

          {/* 右侧按钮组 */}
          <div className="flex flex-1 items-center gap-3">
            <Button
              variant="secondary"
              className="flex-1 rounded-full font-semibold shadow-sm"
              onClick={addToCart}
              disabled={isAdding || product.quantity === 0}
            >
              {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              加入购物车
            </Button>

            <Button
              className="flex-1 rounded-full font-semibold shadow-sm"
              onClick={buyNow}
              disabled={isBuying || product.quantity === 0}
            >
              {isBuying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product.quantity === 0 ? "已售罄" : "立即购买"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
