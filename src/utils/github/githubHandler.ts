import type {Octokit} from "@octokit/rest";

const localStoragePatKey = "GitHubPatToken"
export const githubRepo = import.meta.env.VITE_GITHUB_DATA_REPO;
export const githubOwner = import.meta.env.VITE_GITHUB_DATA_REPO_OWNER;



export type GithubFileInfo = {
    type: "file" | "directory",
    path: string
}
export type GithubFileContent = GithubFileInfo & {
    files?: GithubFileInfo[],
    fileContent?: string
}



export function GetStoredPat():string | null{
    return localStorage.getItem(localStoragePatKey)
}
export function StorePat(pat:string){
    localStorage.setItem(localStoragePatKey, pat)
}
export function DeletePat(){
    localStorage.removeItem(localStoragePatKey)
}





export async function GetTreeDataFileContent(path: string, octokit:Octokit): Promise<GithubFileContent> {
    const {data} = await octokit.rest.repos.getContent({
        owner: githubOwner,
        repo: githubRepo,
        path: path
    });

    // If it's a file, the content will be base64 encoded
    if (Array.isArray(data)) {
        return {
            type: "directory",
            files: data.map(d => {
                const fileType: "file" | "directory" = d.type == 'file' ? "file" : "directory";
                return {path: d.path, type: fileType}
            }),
            path: path
        }
    } else {
        // @ts-ignore
        const content = atob(data.content);
        return {fileContent: content, type: 'file', path: path};
    }

}
