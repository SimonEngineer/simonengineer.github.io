
export interface PageMeta{
    id: number;
    sequenceId: number;
    pageName: string;
    active: boolean;
}

export interface PagesMeta {
    projectId: number;
    pages: PageMeta[];
}
