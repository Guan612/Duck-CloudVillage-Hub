import {
  getRouterContext,
  Outlet,
  useLocation,
  useMatches,
} from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { forwardRef } from "react";

// 定义动画效果：iOS 风格的堆叠效果
const variants = {
  // 初始状态：新页面在屏幕右侧外，且层级更高
  initial: {
    x: "100%",
    opacity: 1,
    scale: 1,
    zIndex: 20,
    boxShadow: "-10px 0px 20px rgba(0,0,0,0.1)", // 加点阴影更有层次感
  },
  // 进场状态：滑入屏幕中间
  enter: {
    x: "0%",
    opacity: 1,
    scale: 1,
    zIndex: 20,
  },
  // 离场状态：旧页面稍微向左移动一点点（视差效果），并变暗
  exit: {
    x: "-20%",
    opacity: 0.8,
    scale: 0.95, // 稍微缩小一点，增加纵深感
    zIndex: 0,
  },
};

export const AnimatedOutlet = () => {
  const routerContext = getRouterContext();
  const matches = useMatches();
  // 使用 pathname 作为 key，只有路径变了才触发动画
  const location = useLocation();

  // 这是一个 TanStack Router 的高级技巧：
  // 为了让离场动画播放时，旧的路由组件仍然被渲染，我们需要"克隆"当前的路由上下文
  // 否则路由一变，旧组件立马就被卸载了，动画就没了。
  const RenderedOutlet = () => <Outlet />;

  return (
    // mode="popLayout" 是关键，它让退出的元素脱离文档流，防止布局跳动
    <AnimatePresence mode="popLayout">
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        // 🔥 核心修改：
        // 1. h-full w-full bg-background: 确保这个滑动的块填满整个区域且有背景色
        // 2. overflow-y-auto: 让这个滑动的块负责滚动
        // 3. flex justify-center: 让内部的内容水平居中
        className="h-full w-full bg-background overflow-y-auto overflow-x-hidden flex justify-center relative z-0"
        style={{
          gridArea: "1 / 1 / 2 / 2",
        }}
      >
        {/* 🔥 新增一层容器：负责限制宽度和内边距 */}
        {/* w-full: 占满父级宽度 */}
        {/* md:max-w-4xl: 在大屏下限制最大宽度 */}
        {/* p-4 pb-safe md:p-6: 统一的内边距 */}
        <div className="w-full h-full p-2 pb-safe md:p-6 md:max-w-4xl relative">
          <RenderedOutlet />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
