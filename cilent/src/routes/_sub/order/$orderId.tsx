import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sub/order/$orderId")({
  component: RouteComponent,
  staticData: {
    title: "订单详情",
  },
});

function RouteComponent() {
  return <div>Hello "/_sub/oder/$orderId"!</div>;
}
