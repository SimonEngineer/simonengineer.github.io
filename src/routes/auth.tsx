import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>): { authData:string } =>{
        const {authData} = search;

        return {
            authData: String(authData)
        }
    }
})

function RouteComponent() {
    const data = Route.useSearch()
    return <div>Hello "/auth"!, Search param {data.authData}</div>
}
