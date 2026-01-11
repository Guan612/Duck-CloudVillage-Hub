import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/me/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/me"!</div>;
}
