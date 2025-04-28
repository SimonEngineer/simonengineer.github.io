import {createFileRoute} from '@tanstack/react-router'

async function GetTestAsyncData(): Promise<{ name:string }> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({name: 'test'});
        }, 3000);
    });
}

export const Route = createFileRoute('/about')({
    component: RouteComponent,
    loader: () =>  GetTestAsyncData(),
    pendingComponent: PendingComponent,

})



function RouteComponent() {
    const d = Route.useLoaderData()
    return (
        <div className="App">
            <h1>About</h1>
            <div>Name: {d.name}</div>
        </div>
    )
}

function PendingComponent() {

    return (
        <div className="App">
            <h1>Pending</h1>

        </div>
    )
}
