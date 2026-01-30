import { requireAuth } from "@/hooks/auth/useAuthGurad";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sub/me/editUserInfo")({
  component: RouteComponent,
  staticData: {
    title: "我的资料",
  },
  beforeLoad: ({ location }) => requireAuth(location.href),
});

function RouteComponent() {
  return <div>Hello "/me/editUserInfo"!</div>;
}
