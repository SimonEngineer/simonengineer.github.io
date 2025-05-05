import type {Octokit} from "@octokit/rest";

const localStoragePatKey = "GitHubPatToken"
const localStorageCommitTokenKeyGenerator = (branch: string) => `commit:${branch}`;
export const githubRepoProjectsKey = "projects"
export const defaultGithubDataRepo = import.meta.env.VITE_GITHUB_DATA_REPO;
export const defaultGithubOwner = import.meta.env.VITE_GITHUB_DATA_REPO_OWNER;


export type GithubFileInfo = {
    type: "file" | "directory",
    path: string
}
export type GithubFileContent = GithubFileInfo & {
    files?: GithubFileInfo[],
    fileContent?: string | null
}


export function GetStoredPat(): string | null {
    return localStorage.getItem(localStoragePatKey)
}

export function StorePat(pat: string) {
    localStorage.setItem(localStoragePatKey, pat)
}

export function DeletePat() {
    localStorage.removeItem(localStoragePatKey)
}

type CommitInfo = {
    branch: string;
    sha: string;
    timeOfCommitInMs: number;
}

const commitInfoCacheTimeInSeconds = 60;

async function GetStoredOrFetchAndStoreCommitInfo(branch: string, getCommitFunction: (branch: string) => Promise<CommitInfo | null>): Promise<CommitInfo | null> {
    const localStorageCommitInfo = localStorage.getItem(localStorageCommitTokenKeyGenerator(branch));

    const fetchAndStoreCommitInfo =async ()=>{
        const fetchedCommitInfo = await getCommitFunction(branch);
        if(!fetchedCommitInfo) return null;
        StoreCommitInfo(fetchedCommitInfo)
        return fetchedCommitInfo;
    }
    if (!localStorageCommitInfo) {
        return await fetchAndStoreCommitInfo()
    }
    const commitInfo: CommitInfo = JSON.parse(localStorageCommitInfo) as CommitInfo;
    const now = new Date();
    const delta = (now.getTime() - commitInfo.timeOfCommitInMs)
    const diffInSeconds = Math.round(delta / 1000);
    if(diffInSeconds > commitInfoCacheTimeInSeconds) {
        return await fetchAndStoreCommitInfo()
    }
    return commitInfo;
}

function StoreCommitInfo(commitInfo: CommitInfo) {
    localStorage.setItem(localStorageCommitTokenKeyGenerator(commitInfo.branch),JSON.stringify(commitInfo));
}

export type ProjectIdentifier = {
    projectId: number;
    revision: number;
}
export type FileInfo = {
    path: string,
    content: string
}

export type GitHubRepoInfo =
    {
        owner: string,
        repo: string
    }


export class GitHubRepo {
    private readonly octokit: Octokit;
    private GitHubRepoInfo: GitHubRepoInfo | null = null;

    constructor(octokit: Octokit) {
        this.octokit = octokit;
    }

    public WithGithubInfo(githubInfo: GitHubRepoInfo): GitHubRepo {
        this.GitHubRepoInfo = githubInfo;
        return this;
    }

    private AssertGithubInfoIsSet() {
        if (!this.GitHubRepoInfo) throw new Error("GithubInfo is not set! Call method 'WithGithubInfo' with owner and repo");
    }

    public async GetFileContent(path: string, branch: string): Promise<string | null> {
        this.AssertGithubInfoIsSet();
        const file = await this.GetTreeDataFileContent(`heads/${branch}`, `${path}`);
        if (file.type !== "file") throw new Error(`Given path ${path} is not a file `)
        if (file.fileContent == undefined) return null;
        return file.fileContent;
    }

    public async GetDirectoryContent(path: string, branch: string): Promise<GithubFileInfo[] | null> {
        this.AssertGithubInfoIsSet();
        const directory = await this.GetTreeDataFileContent(`heads/${branch}`, `${path}`);
        if (directory.type !== "directory") throw new Error(`Given path ${path} is not a directory `)
        if (directory.files == undefined) return null;
        return directory.files;
    }

    public async GetBranches(branchFilter: string = ""): Promise<string[]> {
        this.AssertGithubInfoIsSet();
        const data = await this.octokit.git.listMatchingRefs({...this.GitHubRepoInfo!, ref: `heads/${branchFilter}`})
        return data.data.map(p => p.ref.replace(`refs/heads/${branchFilter}`, ""))
    }


    public async CreateBranch(branch: string): Promise<string | null> {
        this.AssertGithubInfoIsSet();
        // const baseSha = await GetStoredOrFetchAndStoreCommitInfo("main", async (branch)=> {
        //     const bR = await this.octokit.repos.getBranch({...this.GitHubRepoInfo!, branch: branch})
        //     return {
        //         timeOfCommitInMs: new Date().getTime(),
        //         branch: branch,
        //         sha: bR.data.commit.sha
        //     }
        // });
        // if(!baseSha)return null;
        // const {data} = await this.octokit.git.createRef({
        //     ...this.GitHubRepoInfo!,
        //     ref: `refs/heads/${branch}`,
        //     sha: baseSha.sha
        // });
        // StoreCommitInfo({branch:"main",timeOfCommitInMs: new Date().getTime(), sha: data.object.sha});
        const base = await this.octokit.repos.getBranch({...this.GitHubRepoInfo!, branch: branch})
        const {data} = await this.octokit.git.createRef({
            ...this.GitHubRepoInfo!,
            ref: `refs/heads/${branch}`,
            sha: base.data.commit.sha
        });

        return data.ref
    }



    public async MergeBranchToMain(branch: string, title: string, body: string): Promise<string> {
        this.AssertGithubInfoIsSet();
        const pr = await this.octokit.pulls.create(
            {
                ...this.GitHubRepoInfo!,
                head: `refs/heads/${branch}`,
                base: "main",
                title: title,
                body: body,
            });

        const merge = await this.octokit.pulls.merge({
            ...this.GitHubRepoInfo!,
            pull_number: pr.data.number,
            merge: "squash",

        });
        if (merge.data.merged) {
            await this.octokit.git.deleteRef({
                ...this.GitHubRepoInfo!,
                ref: `heads/${branch}`,
            });
        }
        return merge.data.message
    }


    public async DeleteBranch(branch: string) {
        this.AssertGithubInfoIsSet();
        await this.octokit.git.deleteRef({
            ...this.GitHubRepoInfo!,
            ref: `heads/${branch}`,
        });

    }

    public async CreateOrUpdateFiles(branch: string, files: FileInfo[], message = "") {
        this.AssertGithubInfoIsSet();
        const refInfo = `heads/${branch}`


        const lastCommitInfo = await GetStoredOrFetchAndStoreCommitInfo(branch, async (branchInternal)=> {
            const refData = await this.octokit.git.getRef({
                ...this.GitHubRepoInfo!,
                ref: refInfo,
            });

            const latestCommitSha = refData.data.object.sha;

            return {
                timeOfCommitInMs: new Date().getTime(),
                branch: branchInternal,
                sha: latestCommitSha
            }
        });
        if(!lastCommitInfo)return null;

        const commitData = await this.octokit.git.getCommit({
            ...this.GitHubRepoInfo!,
            commit_sha: lastCommitInfo.sha,
        });

        const baseTreeSha = commitData.data.tree.sha;

        const tree = await this.octokit.git.createTree(
            {
                ...this.GitHubRepoInfo!,

                base_tree: baseTreeSha,
                tree: files.map(f => ({
                    path: `${f.path}`,
                    mode: '100644' as const,
                    type: 'blob' as const,
                    content: f.content
                }))
            });
        const commit = await this.octokit.git.createCommit({
            ...this.GitHubRepoInfo!,
            message: message,
            tree: tree.data.sha,
            parents: [lastCommitInfo.sha],
        });


        const comm = await this.octokit.git.updateRef({
            ...this.GitHubRepoInfo!,
            ref: refInfo,
            sha: commit.data.sha,
        });
        StoreCommitInfo({branch: branch,timeOfCommitInMs: new Date().getTime(), sha: comm.data.object.sha});

    }


    private async GetTreeDataFileContent(ref: string, path: string): Promise<GithubFileContent> {
        this.AssertGithubInfoIsSet();
        try {
            const {data} = await this.octokit.rest.repos.getContent({
                ...this.GitHubRepoInfo!,
                path: path,
                ref: ref
            });
            // console.log("Get file tree content, data,", data);

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
        } catch (e: unknown) {
            if (typeof e === "object" && e !== null && 'status' in e) {
                if (e.status === 404) {
                    return {fileContent: null, type: 'file', path: path};
                }
            }
            console.log("Error: ", e)
            throw e
        }

    }

}

