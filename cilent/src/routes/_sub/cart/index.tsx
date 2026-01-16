import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sub/cart/")({
  component: RouteComponent,
  staticData: {
    title: "购物车",
  },
});

function RouteComponent() {
  return <div>Hello "/cart/"!</div>;
}
