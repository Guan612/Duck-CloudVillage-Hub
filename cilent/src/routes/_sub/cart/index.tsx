import { requireAuth } from "@/hooks/auth/useAuthGurad";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sub/cart/")({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: RouteComponent,
  staticData: {
    title: "购物车",
  },
});

function RouteComponent() {
  return <div>Hello "/cart/"!</div>;
}
