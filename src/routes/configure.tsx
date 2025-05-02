import {createFileRoute, Link, useRouter} from '@tanstack/react-router'
import {Octokit} from "@octokit/rest";
import {useState} from "react";
import {
    DeletePat,
    GetStoredPat, defaultGithubOwner, GitHubRepo, defaultGithubDataRepo, type GitHubRepoInfo,
    StorePat
} from "@/utils/github/githubHandler.ts";
import {ProjectHandler} from "@/utils/ProjectUtils/ProjectHandler.ts";
import {
    GetWeightTrackerRepoInfo,
    StoreWeightTrackerRepoInfo,
    WeightTrackerHandler
} from "@/utils/weightTracker/weightTrackerHandler.ts";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";

export const Route = createFileRoute('/configure')({
    component: RouteComponent,
    loader: ({context}) => context.someData
})


type GithubPatInfo = {
    checkedLocalStorage: boolean,
    token: string | null,
}
type WeightTrackerRepoInfo = {
    checkedLocalStorage: boolean,
    repo: string | null
}


function RouteComponent() {
    const routeContext = Route.useRouteContext()
    const rtouter = useRouter()

    const [patInput, setPatInput] = useState<string>()
    const [pat, setPat] = useState<GithubPatInfo>({checkedLocalStorage: true, token: GetStoredPat()})
    const [weightTrackerRepoInfoInput, setWeightTrackerRepoInfoInput] = useState<string>()
    const [weightTrackerRepoInfo, setWeightTrackerRepoInfo] = useState<WeightTrackerRepoInfo>({checkedLocalStorage: true, repo: GetWeightTrackerRepoInfo()?.repo ?? null})
    const [githubUserTest, setGithubUser] = useState<{ id: number, name: string }>()
    const [stringifiedTestRepoData, setstringifiedTestRepoData] = useState<string>()


    // console.log("OcktKit: ",r.octokit)
    return <div className="App">
        <Link to={"/"} style={{color:"blue"}}>Home</Link>
        <h1>Configure github Personal Access Token (PAT)</h1>
        <Button onClick={() => {
            DeletePat()
            setPat(p => ({...p, token: null}))
            const unAuthOctokit = new Octokit({auth: null})
            const githubRepoFactory = (repoInfo:GitHubRepoInfo)=> (new GitHubRepo(unAuthOctokit)).WithGithubInfo(repoInfo);
            const projectHandler = new ProjectHandler(githubRepoFactory({repo: defaultGithubDataRepo,owner: defaultGithubOwner}))
            const weightTrackerRepoInfo = GetWeightTrackerRepoInfo()
            const weightTrackerHandler = new WeightTrackerHandler(githubRepoFactory({owner:weightTrackerRepoInfo?.owner ?? "",repo:weightTrackerRepoInfo?.repo ?? ""}))
            rtouter.update({
                context: {
                    ...routeContext,
                    octokit: unAuthOctokit,
                    githubRepoFactory: githubRepoFactory,
                    projectHandler: projectHandler,
                    weightTrackerHandler: weightTrackerHandler,
                }
            })
            rtouter.invalidate()
        }}>Clear pat
        </Button>


        {pat.checkedLocalStorage && !pat.token && (<>
            <Input placeholder={"Pat"} value={patInput}
                   onChange={(e) => setPatInput(e.target.value)}/>
            <Button onClick={() => {

                if (!patInput) return
                StorePat(patInput)
                setPat(p => ({...p, token: patInput}))
                const updatedOctokit = new Octokit({auth: patInput})
                const githubRepoFactory = (repoInfo:GitHubRepoInfo)=> (new GitHubRepo(updatedOctokit)).WithGithubInfo(repoInfo);
                const projectHandler = new ProjectHandler(githubRepoFactory({repo: defaultGithubDataRepo,owner: defaultGithubOwner}))
                const weightTrackerRepoInfo = GetWeightTrackerRepoInfo()
                const weightTrackerHandler = new WeightTrackerHandler(githubRepoFactory({owner:weightTrackerRepoInfo?.owner ?? "",repo:weightTrackerRepoInfo?.repo ?? ""}))

                rtouter.update({
                    context: {
                        ...routeContext,
                        octokit: updatedOctokit,
                        githubRepoFactory:githubRepoFactory,
                        projectHandler: projectHandler,
                        weightTrackerHandler: weightTrackerHandler
                    }
                })
                rtouter.invalidate()

            }}>Save pat
            </Button>
        </>)}

        {weightTrackerRepoInfo.checkedLocalStorage && !weightTrackerRepoInfo.repo && (<>

            <Input placeholder={"Repo"} value={weightTrackerRepoInfoInput}
                   onChange={(e) => setWeightTrackerRepoInfoInput(e.target.value)}/>
            <Button onClick={() => {

                if (!weightTrackerRepoInfoInput) return
                const weightTrackerRepoInfoInMem = {owner: defaultGithubOwner,repo: weightTrackerRepoInfoInput}
                StoreWeightTrackerRepoInfo(weightTrackerRepoInfoInMem)
                setWeightTrackerRepoInfo(p => ({...p, repo: weightTrackerRepoInfoInput}))

                const weightTrackerHandler = new WeightTrackerHandler(routeContext.githubRepoFactory(weightTrackerRepoInfoInMem))
                rtouter.update({
                    context: {
                        ...routeContext,
                        weightTrackerHandler: weightTrackerHandler
                    }
                })
                rtouter.invalidate()

            }}>Save repo
            </Button>
        </>)}

        <div style={{display: 'flex', flexDirection: 'column', width: '50%'}}>
            <Button onClick={async () => {
                const authedUser = await routeContext.octokit.rest.users.getAuthenticated();
                setGithubUser({id: authedUser.data.id, name: authedUser.data.name ?? ""})

            }}> Test get github user
            </Button>
            {githubUserTest && <div>Github user id: {githubUserTest?.id} - Name: {githubUserTest?.name}</div>}

            <Button onClick={async () => {
                const repoData = await routeContext.octokit.git.getRef({
                    owner: defaultGithubOwner,
                    repo: defaultGithubDataRepo,
                    ref: `heads/main`,
                });
                setstringifiedTestRepoData(JSON.stringify(repoData.data, null, 2))

            }}> Test get github repo
            </Button>
            {stringifiedTestRepoData && <div>{stringifiedTestRepoData}</div>}
        </div>
    </div>
}
