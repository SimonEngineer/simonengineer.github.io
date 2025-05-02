import {createFileRoute} from '@tanstack/react-router'
import {useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {defaultGithubDataRepo, defaultGithubOwner} from "@/utils/github/githubHandler.ts";



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
        <div className={""} style={{padding: "1rem" }}>
            <Button onClick={async () => {
                const fetchedProjects = await routerContext.githubRepoFactory({owner:defaultGithubOwner,repo:defaultGithubDataRepo}).GetProjects()
                setProjects(fetchedProjects?.projects.map(x=>x.name) ?? [])
            }}>
                Get projects
            </Button>
            <div>
                <div>Projects:</div>
                {projects.map(x=><div style={{paddingLeft: "1rem"}} key={x}>{x}</div>)}
            </div>
            <Button onClick={async () => {
                const fetchedBranches = await routerContext.githubRepoFactory({owner:defaultGithubOwner,repo:defaultGithubDataRepo}).GetBranches()
                setBranches(fetchedBranches)
            }}>
                Get branches
            </Button>
            <div>
                <div>Branches:</div>
                {branches.map(x=><div style={{paddingLeft: "1rem"}} key={x}>{x}</div>)}
            </div>
            <Input type={"number"} value={newBranchRevision} onChange={e => setNewBranchRevision(Number(e.target.value))}/>
            <Button onClick={async () => {
                const newBranch = await routerContext.githubRepoFactory({owner:defaultGithubOwner,repo:defaultGithubDataRepo}).CreateProjectRevision({projectId:1, revision:newBranchRevision})
                setNewBranchRef(newBranch)
            }}>
                Create branch
            </Button>
            {newBranchRef && <div>
                <div>New branch ref: {newBranchRef}</div>
            </div>}

            <label>Merge revision</label>
            <Input type={"number"} value={mergeRev} onChange={e => setMergeRev(Number(e.target.value))}/>
            <Button onClick={async () => {
                const resMergeMessage = await routerContext.githubRepoFactory({owner:defaultGithubOwner,repo:defaultGithubDataRepo}).MergeBranchToMain(`revisions/1_rev_${mergeRev}`,"Test merge","Test merge")
                setMergeMessage(resMergeMessage)
            }}>
                Merge revision
            </Button>
            {mergeMessage && <div>
                <div>Merge message {mergeMessage}</div>
            </div>}

            <label>Delete rev branch</label>

            <Input  value={deleteRevBranch} onChange={e => setDeleteRevBranch(Number(e.target.value))}/>
            <Button onClick={async () => {
                 await routerContext.githubRepoFactory({owner:defaultGithubOwner,repo:defaultGithubDataRepo}).DeleteRevisionBranch({projectId:1,revision:deleteRevBranch})

            }}>
                Delete revision
            </Button>
        </div>
    )
}
