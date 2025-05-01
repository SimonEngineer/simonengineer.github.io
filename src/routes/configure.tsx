import {createFileRoute, Link, useRouter} from '@tanstack/react-router'
import {Octokit} from "@octokit/rest";
import {useState} from "react";
import {
    DeletePat,
    GetStoredPat, githubOwner, GitHubRepo, githubRepo,
    StorePat
} from "@/utils/github/githubHandler.ts";
import {ProjectHandler} from "@/utils/ProjectUtils/ProjectHandler.ts";

export const Route = createFileRoute('/configure')({
    component: RouteComponent,
    loader: ({context}) => context.someData
})


type GithubPatInfo = {
    checkedLocalStorage: boolean,
    token: string | null,
}


function RouteComponent() {
    const r = Route.useRouteContext()
    const rtouter = useRouter()

    const [patInput, setPatInput] = useState<string>()
    const [pat, setPat] = useState<GithubPatInfo>({checkedLocalStorage: true, token: GetStoredPat()})
    const [githubUserTest, setGithubUser] = useState<{ id: number, name: string }>()
    const [stringifiedTestRepoData, setstringifiedTestRepoData] = useState<string>()


    // console.log("OcktKit: ",r.octokit)
    return <div className="App">
        <Link to={"/"} style={{color:"blue"}}>Home</Link>
        <h1>Configure github Personal Access Token (PAT)</h1>
        <button onClick={() => {
            DeletePat()
            setPat(p => ({...p, token: null}))
            const unAuthOctokit = new Octokit({auth: null})
            const githubRepo = new GitHubRepo(unAuthOctokit);
            const projectHandler = new ProjectHandler(githubRepo)
            rtouter.update({
                context: {
                    octokit: unAuthOctokit,
                    githubRepo: githubRepo,
                    projectHandler: projectHandler,
                }
            })
            rtouter.invalidate()
        }}>Clear pat
        </button>


        {pat.checkedLocalStorage && !pat.token && (<>
            <input placeholder={"Pat"} value={patInput}
                   onChange={(e) => setPatInput(e.target.value)}/>
            <button onClick={() => {

                if (!patInput) return
                StorePat(patInput)
                setPat(p => ({...p, token: patInput}))
                const updatedOctokit = new Octokit({auth: patInput})
                const gitHubRepo =  new GitHubRepo(updatedOctokit)
                const projectHandler = new ProjectHandler(gitHubRepo)
                rtouter.update({
                    context: {
                        octokit: updatedOctokit,
                        githubRepo:githubRepo,
                        projectHandler: projectHandler,
                    }
                })
                rtouter.invalidate()

            }}>Save pat
            </button>
        </>)}

        <div style={{display: 'flex', flexDirection: 'column', width: '50%'}}>
            <button onClick={async () => {
                const authedUser = await r.octokit.rest.users.getAuthenticated();
                setGithubUser({id: authedUser.data.id, name: authedUser.data.name ?? ""})

            }}> Test get github user
            </button>
            {githubUserTest && <div>Github user id: {githubUserTest?.id} - Name: {githubUserTest?.name}</div>}

            <button onClick={async () => {
                const repoData = await r.octokit.git.getRef({
                    owner: githubOwner,
                    repo: githubRepo,
                    ref: `heads/main`,
                });
                setstringifiedTestRepoData(JSON.stringify(repoData.data, null, 2))

            }}> Test get github repo
            </button>
            {stringifiedTestRepoData && <div>{stringifiedTestRepoData}</div>}
        </div>
    </div>
}
