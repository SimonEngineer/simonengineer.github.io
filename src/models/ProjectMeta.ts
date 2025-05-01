

export type ProjectRevision = `rev:${number}`;
export type GithubBranchProjectRevision = `${string}:${ProjectRevision}`;

export interface ProjectMeta {
    id: number;
    name: string;
    active: boolean;
    revision: ProjectRevision;
    projectType:string;
}


export interface ProjectsMeta {
    projects: ProjectMeta[];
}
