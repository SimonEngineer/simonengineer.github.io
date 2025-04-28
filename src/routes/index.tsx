import {createFileRoute, Link} from '@tanstack/react-router'
import {useEffect, useState} from "react";
import {Octokit} from "@octokit/rest";
// import {unknown} from "zod";
//
// type RootPageSearchParams = Record<string, unknown> & {
//     githubPagesRedirectPath:string | null
// }



export const Route = createFileRoute('/')({
    component: App,

    // validateSearch: (search: Record<string, unknown>): RootPageSearchParams =>{
    //     const {githubPagesRedirectPath} = search;
    //
    //     return {
    //         githubPagesRedirectPath: githubPagesRedirectPath == unknown ? null : githubPagesRedirectPath as string,
    //     }
    // }
})

let octokit = new Octokit();

const localStoragePatKey = "GitHubPatToken"
const githubDataRepo = import.meta.env.VITE_GITHUB_DATA_REPO;
const githubDataRepoOwner = import.meta.env.VITE_GITHUB_DATA_REPO_OWNER;

type GithubPatInfo = {
    checkedLocalStorage: boolean,
    token: string | null,
}

type GithubFileInfo = {
    type: "file" | "directory",
    path: string
}
type GithubFileContent = GithubFileInfo & {
    files?: GithubFileInfo[],
    fileContent?: string
}

function App() {

    const [patInput, setPatInput] = useState<string>()
    const [pat, setPat] = useState<GithubPatInfo>({checkedLocalStorage: false, token: null})
    const [treeData, setTreeData] = useState<GithubFileContent[]>([])

    useEffect(() => {
        if (pat.checkedLocalStorage) return
        const localStorageToken = localStorage.getItem(localStoragePatKey)
        setPat({checkedLocalStorage: true, token: localStorageToken ?? null})
        octokit = new Octokit({auth: localStorageToken})
    }, [])


    async function GetTreeDataFileContent(path: string): Promise<GithubFileContent> {
        const {data} = await octokit.rest.repos.getContent({
            owner: githubDataRepoOwner,
            repo: githubDataRepo,
            path: path
        });

        // If it's a file, the content will be base64 encoded
        if (Array.isArray(data)) {
            console.log("Directory: ", data)

            return {
                type: "directory",
                files: data.map( d=>{
                    const fileType: "file" | "directory" = d.type == 'file' ? "file" : "directory";
                    return {path:d.path, type: fileType}}),
                path:path
            }
        } else {
            // @ts-ignore
            const content = atob(data.content);

            console.log(content);
            return {fileContent: content, type: 'file',path:path};
        }

    }


    return (
        <div className="App">
            <h1>Setup github pat</h1>
            <button onClick={() => {
                localStorage.removeItem(localStoragePatKey)
                setPat(p => ({...p, token: null}))
            }}>Clear pat
            </button>


            {pat.checkedLocalStorage && !pat.token && (<>
                <input placeholder={"Pat"} value={patInput}
                       onChange={(e) => setPatInput(e.target.value)}/>
                <button onClick={() => {
                    if (!patInput) return
                    localStorage.setItem(localStoragePatKey, patInput)
                    setPat(p => ({...p, token: patInput}))
                    octokit = new Octokit({auth: patInput})
                }}>Save pat
                </button>
            </>)}

            <button onClick={async () => {
                console.log("PAt: ", pat)

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
            <div>
                <button onClick={async () => {

                    var tree = await octokit.git.getTree({
                        owner: githubDataRepoOwner,
                        repo: githubDataRepo,
                        tree_sha: `heads/main`
                    });
                    console.log("Tree: ", tree)
                    const treeDt: GithubFileContent[] = []
                    for (const treeElement of tree.data.tree) {
                        var data = await GetTreeDataFileContent(treeElement.path!);
                        console.log("Path: ", treeElement.path);
                        console.log("Data: ", data);
                        treeDt.push(data);
                    }
                    setTreeData(treeDt)
                }}>GetFiles
                </button>
                <div>
                    {treeData.map(x => <div key={x.path}>
                        <div>Type: {x.type} - Path: {x.path}</div>
                        {x.type == "directory" && <div style={{paddingLeft: '10px'}}>
                            {x.files?.map((d) => <div key={d.path}>Type: {d.type} - Path: {d.path}</div>)}

                        </div>}

                    </div>)}
                </div>
            </div>


        </div>
    )
}
