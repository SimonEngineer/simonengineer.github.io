import type {Octokit} from "@octokit/rest";
import type {ProjectsMeta} from "@/models/ProjectMeta.ts";

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


export type ProjectIdentifier = {
    projectId: number;
    revision: number;
}
export type FileInfo = {
    path: string,
    content: string
}

export class GitHubRepo {
    private readonly octokit: Octokit;
    private readonly GithubInfo: { owner: string, repo: string };

    constructor(octokit: Octokit) {
        this.octokit = octokit;
        this.GithubInfo = {owner: githubOwner, repo: githubRepo};
    }

    // public async GetProjects(): Promise<string[]> {
    //     const contentInProjectsFolder = await this.GetTreeDataFileContent(githubRepoProjectsKey)
    //     const projects = contentInProjectsFolder.files?.filter(x => x.type === "directory");
    //     if (projects === undefined) return []
    //     return projects.map(p => p.path.replace(`${githubRepoProjectsKey}/`, ""))
    // }
    //Obsolete: Remove
    public async GetProjects(): Promise<ProjectsMeta | null> {
        const projectsFile = await this.GetTreeDataFileContent("heads/main", `${githubRepoProjectsKey}/projects-meta.json`)
        if (projectsFile.type !== "file") throw new Error("projects-meta.json is not a file")
        if (projectsFile.fileContent == undefined) return null;
        return JSON.parse(projectsFile.fileContent) as ProjectsMeta
    }

    public async GetFileContent(path: string, branch:string): Promise<string | null> {
        const file = await this.GetTreeDataFileContent(`heads/${branch}`, `${githubRepoProjectsKey}/${path}`);
        if (file.type !== "file") throw new Error(`Given path ${path} is not a file `)
        if (file.fileContent == undefined) return null;
        return file.fileContent;
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

    public async CreateProjectRevision(project: ProjectIdentifier): Promise<string> {
        const base = await this.octokit.repos.getBranch({...this.GithubInfo, branch: "main"});
        const {data} = await this.octokit.git.createRef({
            ...this.GithubInfo,
            ref: `refs/heads/revisions/${this.GetRevBranchName(project)}`,
            sha: base.data.commit.sha
        });
        return data.ref
    }
    public async CreateBranch(branch:string): Promise<string> {
        const base = await this.octokit.repos.getBranch({...this.GithubInfo, branch: "main"});
        const {data} = await this.octokit.git.createRef({
            ...this.GithubInfo,
            ref: `refs/heads/${branch}`,
            sha: base.data.commit.sha
        });
        return data.ref
    }

    private GetRevBranchName(project: ProjectIdentifier): string {
        return `${project.projectId}_rev_${project.revision}`
    };

    public async MergeBranchToMain(branch:string,title: string, body:string): Promise<string> {
        const pr = await this.octokit.pulls.create(
            {
                ...this.GithubInfo,
                head: `refs/heads/${branch}`,
                base: "main",
                title: title,
                body: body,
            });

        const merge = await this.octokit.pulls.merge({
            ...this.GithubInfo,
            pull_number: pr.data.number,
            merge: "squash",

        });
        if (merge.data.merged) {
            await this.octokit.git.deleteRef({
                ...this.GithubInfo,
                ref: `heads/${branch}`,
            });
        }
        return merge.data.message
    }

    public async DeleteRevisionBranch(project: ProjectIdentifier) {

        await this.octokit.git.deleteRef({
            ...this.GithubInfo,
            ref: `heads/revisions/${this.GetRevBranchName(project)}`,
        });

    }

    //
    // public async CreateOrUpdateFile(project: ProjectIdentifier, fileName: string, fileContent: string) {
    //     const filePath = `${githubRepoProjectsKey}/project-${project.projectId}/content/${fileName}`;
    //     try {
    //         // Check if the file already exists by getting the file's current SHA
    //         const content = await this.octokit.repos.getContent({
    //             ...this.GithubInfo,
    //             path: filePath,
    //             ref: `heads/revisions/${this.GetRevBranchName(project)}`,
    //         });
    //
    //         // If the file exists, you need to update it
    //
    //         // @ts-ignore
    //         const sha = content.data.sha; // SHA of the existing file
    //
    //         // Update the file with a new commit
    //         const updateResponse = await this.octokit.repos.createOrUpdateFileContents({
    //             ...this.GithubInfo,
    //             path: filePath,
    //             message: "Uploaded from website",
    //             content: btoa(fileContent),
    //             sha, // SHA of the existing file for updating
    //             branch: `revisions/${this.GetRevBranchName(project)}`,
    //         });
    //
    //
    //         console.log('File updated successfully:', updateResponse.data);
    //     } catch (e) {
    //         if (typeof e === "object" && e !== null && 'status' in e && e.status === 404) {
    //             // File does not exist, so we create a new file
    //             const createResponse = await this.octokit.repos.createOrUpdateFileContents({
    //                 ...this.GithubInfo,
    //                 path: filePath,
    //                 message: "Uploaded from website",
    //                 content: btoa(fileContent),
    //                 branch: `revisions/${this.GetRevBranchName(project)}`,
    //
    //             });
    //
    //             console.log('File uploaded successfully:', createResponse.data);
    //         } else {
    //             console.error('Error:', e);
    //         }
    //     }
    // }


    public async CreateOrUpdateFiles(branch:string, files: FileInfo[]) {
        const refInfo = `heads/${branch}`
        const refData = await this.octokit.git.getRef({
            ...this.GithubInfo,
            ref: refInfo,
        });

        const latestCommitSha = refData.data.object.sha;

        const commitData = await this.octokit.git.getCommit({
            ...this.GithubInfo,
            commit_sha: latestCommitSha,
        });

        const baseTreeSha = commitData.data.tree.sha;


        const tree = await this.octokit.git.createTree(
            {
                ...this.GithubInfo,

                base_tree: baseTreeSha,
                tree: files.map(f => ({
                    path: `${githubRepoProjectsKey}/${f.path}`,
                    // path: `${githubRepoProjectsKey}/project-${project.projectId}/content/${file.path}`,
                    mode: '100644' as const,
                    type: 'blob' as const,
                    content: f.content
                }))
            });
        const commit = await this.octokit.git.createCommit({
            ...this.GithubInfo,
            message: 'updated files',
            tree: tree.data.sha,
            parents: [latestCommitSha],
        });


        await this.octokit.git.updateRef({
            ...this.GithubInfo,
            ref: refInfo,
            sha: commit.data.sha,
        });


    }


    //Todo need to add ref:
    private async GetTreeDataFileContent(ref: string, path: string): Promise<GithubFileContent> {

        try {
            const {data} = await this.octokit.rest.repos.getContent({
                ...this.GithubInfo,
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

