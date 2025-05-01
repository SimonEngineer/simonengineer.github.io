import {createFileRoute} from '@tanstack/react-router'


import {useState} from "react";


export const Route = createFileRoute('/projects/')({
    component: RouteComponent,
})


function RouteComponent() {
    const routeContext = Route.useRouteContext()
    const [projectName, setProjectName] = useState<string>()
    return <div>
        {/*<button onClick={async () => {*/}
        {/*    await routeContext.githubRepo.CreateOrUpdateFile({*/}
        {/*        projectId: 1,*/}
        {/*        revision: 1*/}
        {/*    }, "test.txt", `Update: ${Date.now()}ms`)*/}

        {/*}}>*/}
        {/*    Update file with time*/}
        {/*</button>*/}
        {/*<button onClick={async () => {*/}
        {/*    const projects = await routeContext.githubRepo.GetProjects()*/}
        {/*    const newProj: ProjectMeta = {id: 1, revision: "rev_0", name: "teest", active: true, projectType: "software"}*/}
        {/*    if (projects != null) {*/}
        {/*        projects.projects.push(newProj)*/}
        {/*    }*/}
        {/*    await routeContext.githubRepo.CreateOrUpdateFiles(`revisions/1_rev_1`, [*/}
        {/*        {*/}
        {/*            path: `project-1/content/someFile.txt`,*/}
        {/*            content: `Update with time: ${Date.now()}ms`*/}
        {/*        },*/}
        {/*        {*/}
        {/*            path: `projects-meta.json`,*/}
        {/*            content: JSON.stringify(projects != null ? projects : {*/}
        {/*                projects: [newProj]*/}
        {/*            } as ProjectsMeta,null,2)*/}
        {/*        }*/}
        {/*    ])*/}
        {/*}}>*/}
        {/*    Update files*/}
        {/*</button> */}


        <input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder={"Project name"}/>
        <button onClick={async () => {
            if(projectName === undefined) return
            await routeContext.projectHandler.GetCreateProject(projectName,"Software")
        }}>
           Create project
        </button>
    </div>
}
