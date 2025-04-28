import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/test/testpath')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): { testData:string } =>{
    const {testData} = search;

    return {
      testData: String(testData)
    }
  }
})

function RouteComponent() {
  const data = Route.useSearch()
  return <div>Hello "/test/testpath"!, Search param {data.testData}</div>
}
