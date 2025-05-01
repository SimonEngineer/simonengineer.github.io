

export type ProjectRevision = `rev_${number}`;

//GithubBranchProjectRevision: {projectId}_rev_{revisionNumber}
export type GithubBranchProjectRevision = `${number}:${ProjectRevision}`;

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
