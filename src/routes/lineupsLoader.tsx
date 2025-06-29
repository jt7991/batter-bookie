import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lineupsLoader')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/lineupsLoader"!</div>
}
