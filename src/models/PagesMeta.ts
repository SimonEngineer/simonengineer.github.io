
export interface PageMeta{
    id: number;
    sequenceId: number;
    pageName: string;
    active: boolean;
}

export interface PagesMeta {
    id: number;
    projectId: number;
    pages: PageMeta[];
}
