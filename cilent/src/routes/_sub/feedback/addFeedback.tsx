import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sub/feedback/addFeedback")({
  component: RouteComponent,
  staticData: {
    title: "新建反馈",
  },
});

function RouteComponent() {
  return <div>Hello "/feedback/addFeedback"!</div>;
}
