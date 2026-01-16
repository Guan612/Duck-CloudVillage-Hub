import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/feedback/addFeedback')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/feedback/addFeedback"!</div>
}
