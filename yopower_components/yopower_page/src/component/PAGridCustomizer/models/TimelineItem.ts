export interface TimelineItem {
    sort: number | null;
    order: any;
    table: string;
    id: string;
    title: string;
    description: string;
    status: {
        value: number | null;
        label: string | null;
        icon: string | null;
        color: string | null;
    };
}