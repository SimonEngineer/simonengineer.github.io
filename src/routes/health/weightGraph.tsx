import { createFileRoute } from '@tanstack/react-router'
import {WeightTrackerChart} from "@/components/WeightTrackerChart.tsx";

export const Route = createFileRoute('/health/weightGraph')({
  component: RouteComponent,
  loader: async ({context: {weightTrackerHandler}}) => await weightTrackerHandler.GetWeightData(),
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return (
      <div>
        <WeightTrackerChart weightData={data} />
      </div>
  )
}
