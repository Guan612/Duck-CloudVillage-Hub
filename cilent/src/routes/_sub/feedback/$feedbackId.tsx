import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_sub/feedback/$feedbackId")({
  component: RouteComponent,
  staticData: {
    title: "反馈详情",
  },
});

function RouteComponent() {
  return <div>Hello "/feedback/$feedbackId"!</div>;
}
