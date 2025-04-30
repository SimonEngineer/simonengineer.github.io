import {createFileRoute} from '@tanstack/react-router'
import {useState} from "react";

export const Route = createFileRoute('/')({
    component: App,
})


function App() {
    const routerContext = Route.useRouteContext()
    const [projects, setProjects] = useState<string[]>([])
    return (
        <div style={{padding: "1rem" }}>
            <button onClick={async () => {
                const fetchedProjects = await routerContext.githubRepo.GetProjects()
                setProjects(fetchedProjects)
            }}>
                Get projects
            </button>
            <div>
                <div>Projects:</div>
                {projects.map(x=><div style={{paddingLeft: "1rem"}} key={x}>{x}</div>)}
            </div>

        </div>
    )
}
