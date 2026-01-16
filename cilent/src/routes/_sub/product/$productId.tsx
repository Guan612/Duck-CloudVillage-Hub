import { AppSidebar } from "@/components/component/sidebar";
import { Button } from "@/components/ui/button";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { ChevronLeft, Share2, ShoppingCart, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_sub/product/$productId")({
  component: RouteComponent,
  staticData: {
    title: "产品详情",
  },
});

function RouteComponent() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const handleAddToCart = () => {
    setIsAdding(true);

    // 模拟网络请求延迟
    setTimeout(() => {
      setIsAdding(false);
      // 这里的 alert 可以换成 toast.success("添加成功")
      toast.success("已成功加入购物车", {
        description: "您可以在购物车中修改数量",
        duration: 3000, // 3秒后消失
        // ✨ 高级技巧：在 Toast 里加按钮
        action: {
          label: "去结算",
          onClick: () => navigate({ to: "/cart" }),
        },
      });
    }, 800);
  };
  return (
    // ✅ 2. 外层容器改为 flex 布局，模拟主布局的结构
    <div className="flex h-full w-full bg-background">
      {/* ✅ 3. 在这里插入 Sidebar！ */}
      {/* 关键 CSS: "hidden md:flex" */}
      {/* 解释: 手机上 hidden (看不见)，PC 上 flex (显示在左侧) */}
      {/* ✅ 4. 右侧内容区域 (详情页主体) */}
      {/* flex-1: 占满剩余空间 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-50 bg-background">
        {/* 顶部导航栏 */}

        {/* 滚动内容区 */}
        <main className="flex-1 overflow-y-auto pb-safe-or-24 p-4 scrollbar-hide">
          {/* ... 商品图片、标题、价格、详情 ... */}
          <div>商品 ID: {productId}</div>
          {/* ... */}
        </main>

        {/* 底部购买栏 (只属于详情页) */}
        {/* 手机端: 固定在底部 */}
        {/* PC端: 也会显示在内容区的底部 (因为是在 flex-1 容器内)，不会覆盖 Sidebar */}
        <div className="border-t border-border/40 px-4 pt-3 pb-safe-offset-4 bg-background/95 backdrop-blur-md flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] z-50">
          {/* 左侧：店铺/购物车入口 (图标按钮) */}
          <div className="flex items-center gap-4 mr-2">
            <button className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-primary transition-colors">
              <Store size={20} />
              <span className="text-[10px] font-medium">店铺</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-primary transition-colors relative">
              <ShoppingCart size={20} />
              <span className="text-[10px] font-medium">购物车</span>
              {/* 购物车角标 (可选) */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] text-white">
                2
              </span>
            </button>
          </div>

          {/* 右侧：双按钮组合 */}
          {/* 这里的 flex-1 确保按钮组占满剩余空间 */}
          <div className="flex flex-1 gap-2">
            {/* 🛒 加入购物车：橙色系 */}
            <Button
              variant="secondary"
              className="flex-1 rounded-full bg-secondary hover:bg-secondary/80 text-white shadow-sm font-bold"
              onClick={handleAddToCart}
              disabled={isAdding} // 防止重复点击
            >
              {isAdding ? "加入中..." : "加入购物车"}
            </Button>

            {/* 💰 立即购买：主色系 (你的品牌绿) */}
            <Button className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm font-bold">
              立即购买
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
