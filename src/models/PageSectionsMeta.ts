


export interface PageSection {
    id: number;
    sequenceId: number;
    sectionTitle: string;
    active: boolean;
    type: string;
    contentLocation:string;
}

export interface PageSectionsMeta {
    id: number;
    pageId: number;
    sections: PageSection[];
}
