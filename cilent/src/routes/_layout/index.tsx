import { createFileRoute } from "@tanstack/react-router";
import {
  CloudSun,
  MapPin,
  Sprout,
  ShoppingBasket,
  Newspaper,
  Thermometer,
  Droplets,
  Wind,
  ArrowRight,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_layout/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="space-y-6 p-4 md:p-6 pb-20">
      {" "}
      {/* pb-20 防止被底部导航栏遮挡 */}
      {/* 1. 顶部 Hero 区域：天气与问候 */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/80 to-secondary p-6 text-white shadow-lg">
        {/* 装饰背景圆圈 */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />

        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-sm font-medium opacity-90">早安，扎西 👋</p>
            <h1 className="mt-1 text-2xl font-bold">云上乡村欢迎你</h1>
            <div className="mt-4 flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur-md w-fit">
              <MapPin size={14} />
              <span>西藏 · 林芝</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <CloudSun size={48} className="mb-2" />
            <span className="text-3xl font-bold">18°</span>
            <span className="text-xs opacity-80">多云转晴</span>
          </div>
        </div>
      </section>
      {/* 2. 金刚区 (Quick Actions) - 功能快捷入口 */}
      <section className="grid grid-cols-4 gap-4">
        <QuickAction
          icon={Sprout}
          label="智慧农耕"
          color="bg-green-100 text-green-700"
        />
        <QuickAction
          icon={ShoppingBasket}
          label="云上集市"
          color="bg-orange-100 text-orange-700"
        />
        <QuickAction
          icon={Newspaper}
          label="村务公开"
          color="bg-blue-100 text-blue-700"
        />
        <QuickAction
          icon={QrCode}
          label="扫码办事"
          color="bg-purple-100 text-purple-700"
        />
      </section>
      {/* 3. 智慧农耕看板 (数据可视化) */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">智慧大棚检测</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-8 text-xs"
          >
            查看详情 <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 这里用了 grid-cols-1 md:grid-cols-3 实现了响应式 */}
          <SensorCard
            title="空气温度"
            value="24.5°C"
            status="正常"
            icon={Thermometer}
            color="text-red-500"
          />
          <SensorCard
            title="土壤湿度"
            value="68%"
            status="偏干"
            isWarning
            icon={Droplets}
            color="text-blue-500"
          />
          <SensorCard
            title="光照强度"
            value="12000 Lux"
            status="充足"
            icon={CloudSun}
            color="text-yellow-500"
          />
        </div>
      </section>
      {/* 4. 乡村好物 (横向滚动列表) */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">乡村好物推荐</h2>
          <span className="text-xs text-muted-foreground">助农增收</span>
        </div>

        {/* 横向滚动容器 */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <ProductCard
            image="https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=200&auto=format&fit=crop"
            title="高山有机苹果"
            price="¥ 58.00"
            tag="热销"
          />
          <ProductCard
            image="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=200&auto=format&fit=crop"
            title="农家散养土鸡蛋"
            price="¥ 25.00"
          />
          <ProductCard
            image="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=200&auto=format&fit=crop"
            title="手工牦牛肉干"
            price="¥ 128.00"
            tag="特产"
          />
        </div>
      </section>
      {/* 5. 底部装饰 (可选) */}
      <div className="text-center text-xs text-muted-foreground py-4">
        - 科技赋能 · 振兴乡村 -
      </div>
    </div>
  );
}

// --- 下面是拆分出来的子组件，为了让主代码更干净 ---

// 1. 快捷入口组件
function QuickAction({
  icon: Icon,
  label,
  color,
}: {
  icon: any;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95 hover:scale-105">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${color}`}
      >
        <Icon size={24} />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

// 2. 传感器数据卡片
function SensorCard({
  title,
  value,
  status,
  icon: Icon,
  color,
  isWarning,
}: any) {
  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{title}</p>
          <p className="text-xl font-bold font-mono">{value}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Icon size={20} className={color} />
          <Badge
            variant={isWarning ? "destructive" : "outline"}
            className="text-[10px] h-5 px-1.5"
          >
            {status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// 3. 商品卡片
function ProductCard({ image, title, price, tag }: any) {
  return (
    <div className="flex-shrink-0 w-36 group cursor-pointer">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform group-hover:scale-110"
        />
        {tag && (
          <div className="absolute top-2 left-2 rounded bg-red-500 px-1.5 py-0.5 text-[10px] text-white font-bold shadow-sm">
            {tag}
          </div>
        )}
      </div>
      <div className="mt-2">
        <h3 className="truncate text-sm font-medium text-foreground">
          {title}
        </h3>
        <p className="text-sm font-bold text-primary">{price}</p>
      </div>
    </div>
  );
}
