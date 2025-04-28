import {createFileRoute, Link, useRouter} from '@tanstack/react-router'
import {useEffect, useState} from "react";
import {Octokit} from "@octokit/rest";
import {unknown} from "zod";

type RootPageSearchParams = Record<string, unknown> & {
    githubPagesRedirectPath:string | null
}

export const Route = createFileRoute('/')({
    component: App,
    validateSearch: (search: Record<string, unknown>): RootPageSearchParams =>{
        const {githubPagesRedirectPath} = search;

        return {
            githubPagesRedirectPath: githubPagesRedirectPath == unknown ? null : githubPagesRedirectPath as string,
        }
    }
})

const localStoragePatKey = "GitHubPatToken"
const githubDataRepo = import.meta.env.VITE_GITHUB_DATA_REPO;
const githubDataRepoOwner = import.meta.env.VITE_GITHUB_DATA_REPO_OWNER;

type GithubPatInfo = {
    checkedLocalStorage: boolean,
    token: string | null,
}


function App() {
    const searchParams = Route.useSearch()
    const router = useRouter()
    console.log("Index searchParams: ",searchParams)
    //Because the pages need to be in separate files because of GitHub pages, need this redirect to hand over the control back to tanstack router
    if(searchParams.githubPagesRedirectPath != null){
        const {githubPagesRedirectPath, ...rest} = searchParams
        router.navigate({to: githubPagesRedirectPath, search: rest })
        // console.log("Search params: ",searchParams)
        // console.log("githubPagesRedirectPath: ",githubPagesRedirectPath)
        // console.log("rest: ",rest)
        return
        // return <div>
        //
        //     <button onClick={()=>{ router.navigate({to: githubPagesRedirectPath, search: rest })}}>Redirect</button>
        // </div>;
    }
    const [patInput, setPatInput] = useState<string>()
    const [pat, setPat] = useState<GithubPatInfo>({checkedLocalStorage: false, token: null})

    useEffect(() => {
        if (pat.checkedLocalStorage) return
        const localStorageToken = localStorage.getItem(localStoragePatKey)
        setPat({checkedLocalStorage: true, token: localStorageToken ?? null})
    }, [])
    return (
        <div className="App">
            <h1>Setup github pat</h1>
            <button onClick={() => {
                localStorage.removeItem(localStoragePatKey)
                setPat(p=>({...p, token: null}))
            }}>Clear pat
            </button>


            {pat.checkedLocalStorage && !pat.token && (<>
                <input placeholder={"Pat"} value={patInput}
                       onChange={(e) => setPatInput(e.target.value)}/>
                <button onClick={() => {
                    if (!patInput) return
                    localStorage.setItem(localStoragePatKey, patInput)
                    setPat(p => ({...p, token: patInput}))
                }}>Save pat
                </button>
            </>)}

            <button onClick={async () => {
                console.log("PAt: ", pat)
                const octokit = new Octokit({
                    auth: pat.token, // Use the PAT for authentication
                });
                const data = await octokit.git.getRef({
                    owner: githubDataRepoOwner,
                    repo: githubDataRepo,
                    ref: `heads/main`,
                });
                console.log("Data: ", data)
                const authed = await octokit.rest.users.getAuthenticated();
                console.log("Authed: ", authed)
            }}> Test github
            </button>
            <Link to={"/about"}>To about</Link>


        </div>
    )
}
