import type {FileInfo, GitHubRepo} from "@/utils/github/githubHandler.ts";
import type {ProjectMeta, ProjectsMeta} from "@/models/ProjectMeta.ts";
import type {PagesMeta} from "@/models/PagesMeta.ts";


export class ProjectHandler{
    private readonly GitHubRepo: GitHubRepo;

    private readonly _projectsFile = "projects-meta.json";
    private readonly _mainBranch = "main";
    constructor(gitHubRepo: GitHubRepo) {
        this.GitHubRepo = gitHubRepo;
    }

    public async GetProjects(): Promise<ProjectsMeta | null> {
        const projectsData = await this.GitHubRepo.GetFileContent(this._projectsFile,this._mainBranch)
        if (!projectsData) return null;
        return JSON.parse(projectsData) as ProjectsMeta
    }

    // private GetRevBranchName(project: ProjectIdentifier): string {
    //     return `${project.projectId}_rev_${project.revision}`
    // };

    public async GetCreateProject(projectName:string, projectType:string) {
        const projectsMeta = await this.GetProjects() ?? {
            projects:[]
        }

        const projectsMaxId = Math.max(...projectsMeta.projects.map(x=>x.id))
        const newProjectId = isFinite(projectsMaxId) ? projectsMaxId + 1 : 0;
        const projectMeta: ProjectMeta = {
            id: newProjectId,
            name: projectName,
            projectType:projectType,
            active: true,
            revision:"rev_0"
        }

        projectsMeta.projects.push(projectMeta);
        projectsMeta.projects = projectsMeta.projects.sort((a,b)=>a.id - b.id)


        const pagesMeta: PagesMeta = {
            projectId: newProjectId,
            pages: []
        }

        const files: FileInfo[] = [
            {
                path: this._projectsFile,
                content: JSON.stringify(projectsMeta,null, 2),
            },
            {
                path: `project-${newProjectId}/project-meta.json`,
                content: JSON.stringify(projectMeta,null, 2),
            },{
                path: `project-${newProjectId}/pages-meta.json`,
                content: JSON.stringify(pagesMeta,null, 2),
            }
        ]
        //Todo: Consider adding back the branch, upload, pr, merge flow, for safety to prevent directly writing to main
        await this.GitHubRepo.CreateOrUpdateFiles(this._mainBranch,files, `Uploaded filed to create project "${projectName}" - Id: ${newProjectId}`)

    }
}
