import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout")({
  component: Index,
});

function Index() {
  return (
    <div className="h-full">
      <nav>顶栏 (Navbar)</nav>
      <div className="flex">
        <main className="flex">
          <div className="flex flex-col">
            <Link to="/me">我的页面</Link>
            <Link to="/about">关于页面</Link>
          </div>
          {/* 这里渲染子路由，比如首页内容 */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
