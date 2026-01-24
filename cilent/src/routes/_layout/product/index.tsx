import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Filter, ShoppingBag, Coins, ShoppingCart, Loader2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import useProduct from "@/hooks/product/useProduct";
import type { Product } from "@/types/api-responses";

export const Route = createFileRoute("/_layout/product/")({
  component: ProductListPage,
});

// --- 分类数据 ---
const CATEGORIES = [
  "全部",
  "时令水果",
  "高山蔬菜",
  "非遗手作",
  "民宿体验",
  "粮油干货",
];

function ProductListPage() {
  const { products, loading, error, getProducts } = useProduct();

  return (
    <div className="min-h-full pb-4 bg-background">
      {/* --- 第一部分：标题栏 (普通流，会随页面滚动消失) --- */}
      <div className="px-4 py-3 pt-4 bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">积分商城</h1>
          <div className="flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500 shadow-sm">
            <Coins size={14} className="fill-current" />
            <span>余额: 8,420</span>
          </div>
        </div>
      </div>

      {/* --- 第二部分：搜索栏 (Sticky 吸顶，滚动后会停留在顶部) --- */}
      {/* top-0: 吸附位置 */}
      {/* z-30: 保证层级在商品列表之上 */}
      {/* bg-background/80 + backdrop-blur: 毛玻璃背景，防止遮挡内容时太生硬 */}
      <div className="sticky top-0 z-30 px-4 pt-2 pb-3 bg-background/75 backdrop-blur-md transition-all">
        <div className="relative items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="搜索农特产..."
            className="pl-9 h-10 rounded-full bg-muted/50 border-none focus-visible:ring-primary/50 transition-all focus:bg-background focus:shadow-sm"
          />
        </div>
      </div>

      {/* --- 第三部分：分类导航 (普通流，或者你也想让它吸顶？) --- */}
      {/* 这里我设置为不吸顶，它会跟着标题一起滚上去。如果想吸顶，把 sticky 加在这里即可 */}
      <div className="px-4 mt-2 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat, index) => (
            <button
              key={cat}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                index === 0
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* --- 第四部分：产品列表 --- */}
      <div className="px-4">
        {/* 加载状态 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive mb-3">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={getProducts}
              className="gap-2"
            >
              <RefreshCw size={14} />
              重新加载
            </Button>
          </div>
        )}

        {/* 正常状态 */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} data={product} />
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">暂无商品</p>
          </div>
        )}

        <div className="py-6 text-center text-xs text-muted-foreground">
          - 更多好物正在上架中 -
        </div>
      </div>

      <Link
        to="/cart"
        className="fixed bottom-24 right-4 md:right-12 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-90 transition-transform z-20"
      >
        <ShoppingCart size={24} />
      </Link>
    </div>
  );
}

// --- 子组件：产品卡片 ---
function ProductCard({ data }: { data: Product }) {
  return (
    // 使用 Link 包裹整个卡片，点击跳转详情页
    // 这里假设详情页路由是 /product/$productId
    <Link
      to="/product/$productId"
      params={{ productId: String(data.id) }}
      className="group block"
    >
      <Card className="overflow-hidden border-none shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 active:scale-95 bg-card">
        {/* 图片区域 */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={data.imgUrl || "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=400&auto=format&fit=crop"}
            alt={data.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* 内容区域 */}
        <CardContent className="p-3">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground min-h-[2.5em]">
            {data.name}
          </h3>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary">
              {data.price}
            </span>
            <span className="text-xs text-muted-foreground">积分</span>
          </div>
        </CardContent>

        <CardFooter className="p-3 pt-0 flex items-center justify-between text-xs text-muted-foreground">
          <span>库存: {data.quantity}</span>
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <ShoppingBag size={12} />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
