import type {Octokit} from "@octokit/rest";

const localStoragePatKey = "GitHubPatToken"
const githubRepoProjectsKey = "projects"
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


export function GetStoredPat(): string | null {
    return localStorage.getItem(localStoragePatKey)
}

export function StorePat(pat: string) {
    localStorage.setItem(localStoragePatKey, pat)
}

export function DeletePat() {
    localStorage.removeItem(localStoragePatKey)
}


export async function GetTreeDataFileContent(path: string, octokit: Octokit): Promise<GithubFileContent> {
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


export class GitHubRepo {
    private readonly octokit: Octokit;
    private readonly GithubInfo: { owner: string, repo: string };

    constructor(octokit: Octokit) {
        this.octokit = octokit;
        this.GithubInfo = {owner: githubOwner, repo: githubRepo};
    }

    public async GetProjects(): Promise<string[]> {
        const contentInProjectsFolder = await this.GetTreeDataFileContent(githubRepoProjectsKey)
        const projects = contentInProjectsFolder.files?.filter(x => x.type === "directory");
        if (projects === undefined) return []
        return projects.map(p => p.path.replace(`${githubRepoProjectsKey}/`, ""))
    }

    public async GetBranches(): Promise<string[]> {
        const data = await this.octokit.git.listMatchingRefs({...this.GithubInfo, ref: "heads"})
        return data.data.map(p => p.ref.replace("refs/heads/", ""))
    }

    public async GetProjectRevisions(projectId: number): Promise<string[]> {
        const data = await this.octokit.git.listMatchingRefs({...this.GithubInfo, ref: `heads/revisions/${projectId}`})
        return data.data.map(p => p.ref.replace("refs/heads/revisions/", ""))
    }

    public async GetRevisionBranches(): Promise<string[]> {
        const data = await this.octokit.git.listMatchingRefs({...this.GithubInfo, ref: `heads/revisions/`})
        return data.data.map(p => p.ref.replace("refs/heads/revisions/", ""))
    }

    public async CreateProjectRevision(projectId: number, revision: number): Promise<string> {
        const base = await this.octokit.repos.getBranch({...this.GithubInfo, branch: "main"});
        const {data} = await this.octokit.git.createRef({
            ...this.GithubInfo,
            ref: `refs/heads/revisions/${projectId}_rev_${revision}`,
            sha: base.data.commit.sha
        });
        return data.ref
    }

    public async MergeRevisionToMain(projectId: number, revision: number): Promise<string> {
        const pr = await this.octokit.pulls.create(
            {
                ...this.GithubInfo,
                head: `refs/heads/revisions/${projectId}_rev_${revision}`,
                // ref:"",
                base: "main",
                title: `Merge revision ${revision} of project ${projectId} into main`,
                body: `Auto-generated PR to merge ${revision} of project ${projectId} into main`,
            });

        const merge = await this.octokit.pulls.merge({
            ...this.GithubInfo,
            pull_number: pr.data.number,
            merge: "squash",

        });
        if (merge.data.merged) {
            await this.octokit.git.deleteRef({
                ...this.GithubInfo,
                ref: `heads/revisions/${projectId}_rev_${revision}`,
            });
        }
        return merge.data.message
    }

    public async DeleteRevisionBranch(projectId: number, revision: number) {

      await this.octokit.git.deleteRef({
            ...this.GithubInfo,
            ref: `heads/revisions/${projectId}_rev_${revision}`,
        });

    }


    private async GetTreeDataFileContent(path: string): Promise<GithubFileContent> {
        const {data} = await this.octokit.rest.repos.getContent({
            ...this.GithubInfo,
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

}

