import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Filter, ShoppingBag, Coins, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export const Route = createFileRoute("/_layout/product/")({
  component: ProductListPage,
});

// --- 模拟数据 ---
const CATEGORIES = [
  "全部",
  "时令水果",
  "高山蔬菜",
  "非遗手作",
  "民宿体验",
  "粮油干货",
];

const PRODUCTS = [
  {
    id: "101",
    title: "高山有机红富士苹果 (12个装)",
    image:
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=400&auto=format&fit=crop",
    points: 1200,
    tags: ["助农", "包邮"],
    sales: 342,
  },
  {
    id: "102",
    title: "农家散养土鸡蛋 (30枚)",
    image:
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=400&auto=format&fit=crop",
    points: 800,
    tags: ["热销"],
    sales: 1205,
  },
  {
    id: "103",
    title: "手工编织竹篮/收纳筐",
    image:
      "https://images.unsplash.com/photo-1598532163257-5264858b2912?q=80&w=400&auto=format&fit=crop",
    points: 2500,
    tags: ["非遗"],
    sales: 56,
  },
  {
    id: "104",
    title: "林芝松茸干片 (50g)",
    image:
      "https://images.unsplash.com/photo-1599818685453-93d396860bc8?q=80&w=400&auto=format&fit=crop",
    points: 5800,
    tags: ["特产"],
    sales: 89,
  },
  {
    id: "105",
    title: "云上乡村·星空露营券",
    image:
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=400&auto=format&fit=crop",
    points: 12000,
    tags: ["体验"],
    sales: 12,
  },
  {
    id: "106",
    title: "古法压榨菜籽油 (5L)",
    image:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd03a2?q=80&w=400&auto=format&fit=crop",
    points: 3200,
    tags: [],
    sales: 210,
  },
];

function ProductListPage() {
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
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} data={product} />
          ))}
        </div>

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
function ProductCard({ data }: { data: (typeof PRODUCTS)[0] }) {
  return (
    // 使用 Link 包裹整个卡片，点击跳转详情页
    // 这里假设详情页路由是 /product/$productId
    <Link
      to="/product/$productId"
      params={{ productId: data.id }}
      className="group block"
    >
      <Card className="overflow-hidden border-none shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 active:scale-95 bg-card">
        {/* 图片区域 */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={data.image}
            alt={data.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* 如果有 Tag 显示在左上角 */}
          {data.tags.length > 0 && (
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {data.tags.map((tag) => (
                <Badge
                  key={tag}
                  className="bg-red-500/90 hover:bg-red-500 text-[10px] px-1.5 h-5 backdrop-blur-sm border-none shadow-sm"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* 内容区域 */}
        <CardContent className="p-3">
          <h3 className="line-clamp-2 text-sm font-medium text-foreground min-h-[2.5em]">
            {data.title}
          </h3>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary">
              {data.points}
            </span>
            <span className="text-xs text-muted-foreground">积分</span>
          </div>
        </CardContent>

        <CardFooter className="p-3 pt-0 flex items-center justify-between text-xs text-muted-foreground">
          <span>已兑 {data.sales}</span>
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            <ShoppingBag size={12} />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
