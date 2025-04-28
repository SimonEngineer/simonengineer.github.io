import {createFileRoute} from '@tanstack/react-router'
import {useEffect, useState} from "react";
import {Octokit} from "@octokit/rest";

export const Route = createFileRoute('/')({
    component: App,
})

const localStoragePatKey = "GitHubPatToken"
const githubDataRepo = import.meta.env.VITE_GITHUB_DATA_REPO!;
const githubDataRepoOwner = import.meta.env.VITE_GITHUB_DATA_REPO_OWNER!;

type GithubPatInfo = {
    checkedLocalStorage: boolean,
    token: string | null,
}


function App() {
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


        </div>
    )
}
