import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sub/order/")({
  component: RouteComponent,
  staticData: {
    title: "我的订单",
  },
});

function RouteComponent() {
  return <div>Hello "/_sub/oder/"!</div>;
}
