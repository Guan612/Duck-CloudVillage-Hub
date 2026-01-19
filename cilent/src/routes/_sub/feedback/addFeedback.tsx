import { requireAuth } from "@/hooks/auth/useAuthGurad";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sub/feedback/addFeedback")({
  component: RouteComponent,
  beforeLoad: ({ location }) => requireAuth(location.href),
  staticData: {
    title: "新建反馈",
  },
});

function RouteComponent() {
  return <div>Hello "/feedback/addFeedback"!</div>;
}
