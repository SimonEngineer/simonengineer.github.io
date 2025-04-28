import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test/testpath')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/test/testpath"!</div>
}
