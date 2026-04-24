export interface _908AnyCustomTimeline {
    reference: string;
    column: string;
    items: CustomTimeLineItem[];
}

export interface CustomTimeLineItem {
    table: string;
    id: string;
    lookup: string;
    orderby: string;
    title: string;
    description?: string;
    optionset: string;
    rules: CustomTimeLineItemRule[];
}

export interface CustomTimeLineItemRule {
    value: number;
    icon: string;
    color: string;
}
