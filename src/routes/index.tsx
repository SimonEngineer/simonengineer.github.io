import {createFileRoute} from '@tanstack/react-router'
import {useState} from "react";

export const Route = createFileRoute('/')({
    component: App,
})


function App() {
    const routerContext = Route.useRouteContext()
    const [projects, setProjects] = useState<string[]>([])
    const [branches, setBranches] = useState<string[]>([])
    const [newBranchRevision, setNewBranchRevision] = useState<number>(0)
    const [newBranchRef, setNewBranchRef] = useState<string>()
    const [deleteRevBranch, setDeleteRevBranch] = useState<number>(2)
    const [mergeRev, setMergeRev] = useState<number>(0)
    const [mergeMessage, setMergeMessage] = useState<string>()
    return (
        <div style={{padding: "1rem" }}>
            <button onClick={async () => {
                const fetchedProjects = await routerContext.githubRepo.GetProjects()
                setProjects(fetchedProjects?.projects.map(x=>x.name) ?? [])
            }}>
                Get projects
            </button>
            <div>
                <div>Projects:</div>
                {projects.map(x=><div style={{paddingLeft: "1rem"}} key={x}>{x}</div>)}
            </div>
            <button onClick={async () => {
                const fetchedBranches = await routerContext.githubRepo.GetBranches()
                setBranches(fetchedBranches)
            }}>
                Get branches
            </button>
            <div>
                <div>Branches:</div>
                {branches.map(x=><div style={{paddingLeft: "1rem"}} key={x}>{x}</div>)}
            </div>
            <input type={"number"} value={newBranchRevision} onChange={e => setNewBranchRevision(Number(e.target.value))}/>
            <button onClick={async () => {
                const newBranch = await routerContext.githubRepo.CreateProjectRevision({projectId:1, revision:newBranchRevision})
                setNewBranchRef(newBranch)
            }}>
                Create branch
            </button>
            {newBranchRef && <div>
                <div>New branch ref: {newBranchRef}</div>
            </div>}

            <label>Merge revision</label>
            <input type={"number"} value={mergeRev} onChange={e => setMergeRev(Number(e.target.value))}/>
            <button onClick={async () => {
                const resMergeMessage = await routerContext.githubRepo.MergeBranchToMain(`revisions/1_rev_${mergeRev}`,"Test merge","Test merge")
                setMergeMessage(resMergeMessage)
            }}>
                Merge revision
            </button>
            {mergeMessage && <div>
                <div>Merge message {mergeMessage}</div>
            </div>}

            <label>Delete rev branch</label>
            <input type={"number"} value={deleteRevBranch} onChange={e => setDeleteRevBranch(Number(e.target.value))}/>
            <button onClick={async () => {
                 await routerContext.githubRepo.DeleteRevisionBranch({projectId:1,revision:deleteRevBranch})

            }}>
                Delete revision
            </button>
        </div>
    )
}
