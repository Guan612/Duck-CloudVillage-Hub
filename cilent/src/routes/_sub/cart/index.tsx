import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/hooks/auth/useAuthGurad";
import useMyCart from "@/hooks/cart/useMyCart";
import { Checkbox } from "@radix-ui/react-checkbox";
import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_sub/cart/")({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: RouteComponent,
  staticData: {
    title: "购物车",
  },
});

function RouteComponent() {
  const {
    cartItems,
    selectedCount,
    isAllChecked,
    formatPrice,
    toggleCheck,
    toggleAll,
    updateQuantity,
    removeItem,
    handleCheckout,
    total,
  } = useMyCart();
  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* 主内容列表区 
        pb-32: 底部留出足够空间给固定结算栏，避免遮挡最后一条数据
      */}
      {/* 列表区域 */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 pb-32 space-y-3">
        {cartItems.length === 0 ? (
          <div className="flex h-[60vh] flex-col items-center justify-center text-muted-foreground space-y-4">
            <div className="bg-muted/50 p-6 rounded-full">
              <ShoppingBag size={48} strokeWidth={1.5} />
            </div>
            <p className="text-sm">购物车空空如也</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <Card
              key={item.id}
              // 选中状态：边框变绿(primary)，背景微绿，阴影加深
              className={`transition-all duration-200 shadow-sm overflow-hidden ${
                item.checked
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card"
              }`}
            >
              <CardContent className="flex gap-3 p-3">
                {/* 1. 复选框区域 - 垂直居中 */}
                <div className="flex flex-shrink-0 items-center justify-center px-1">
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleCheck(item.id)}
                    // 修复“隐形”问题：添加 border-muted-foreground/30
                    className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                </div>

                {/* 2. 商品图片 - 固定大小 */}
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted/50 border border-border/50">
                  <img
                    src={item.product.imgUrl}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* 3. 信息主体 (Flex Column) */}
                <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
                  {/* 上部分：标题 + 删除按钮 */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1 pr-1">
                      <h3 className="text-sm font-bold leading-tight line-clamp-2 text-foreground/90">
                        {item.product.name}
                      </h3>
                      {/* 库存/规格显示 */}
                      <p className="text-xs text-muted-foreground">
                        库存: {item.product.quantity}
                      </p>
                    </div>

                    {/* 删除按钮 - 放在右上角 */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground/60 hover:text-destructive transition-colors p-1 -mt-1 -mr-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* 下部分：价格 + 数量步进器 */}
                  <div className="flex items-end justify-between mt-2">
                    {/* 价格 */}
                    <div className="font-bold text-lg text-primary tabular-nums tracking-tight">
                      {formatPrice(item.product.price)}
                    </div>

                    {/* 数量控制器 */}
                    <div className="flex items-center gap-2 bg-background/50 rounded-full border border-border/50 px-1 py-0.5 shadow-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={12} strokeWidth={2.5} />
                      </Button>

                      <span className="w-6 text-center text-xs font-bold font-mono">
                        {item.quantity}
                      </span>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={item.quantity >= item.product.quantity}
                      >
                        <Plus size={12} strokeWidth={2.5} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 底部固定结算栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/60 backdrop-blur-xl pb-safe">
        <div className="container flex items-center justify-between px-4 py-3 max-w-md mx-auto">
          {/* 全选 */}
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="selectAll"
              checked={isAllChecked}
              onCheckedChange={toggleAll}
              className="h-5 w-5 rounded-full data-[state=checked]:bg-primary"
            />
            <label
              htmlFor="selectAll"
              className="text-sm font-medium text-muted-foreground cursor-pointer select-none"
            >
              全选 <span className="text-xs">({selectedCount})</span>
            </label>
          </div>

          {/* 合计与按钮 */}
          <div className="flex items-center gap-3">
            <div className="text-right flex flex-col items-end">
              <span className="text-xs text-muted-foreground">
                合计 (不含运费)
              </span>
              <span className="text-lg font-bold text-primary tabular-nums tracking-tight leading-none">
                {formatPrice(total)}
              </span>
            </div>

            <Button
              className="rounded-full px-6 font-bold shadow-sm"
              disabled={selectedCount === 0}
              onClick={() => handleCheckout()}
            >
              结算
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
