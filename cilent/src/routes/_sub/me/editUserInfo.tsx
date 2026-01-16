import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sub/me/editUserInfo")({
  component: RouteComponent,
  staticData: {
    title: "我的资料",
  },
});

function RouteComponent() {
  return <div>Hello "/me/editUserInfo"!</div>;
}
