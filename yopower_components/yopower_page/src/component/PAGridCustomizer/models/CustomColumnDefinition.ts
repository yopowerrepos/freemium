export interface CustomColumnDefinition {
    id: string;
    name: string;
    type: number;
    subgrid: string;
    table: string;
    column: string;
    parameters: any;
    condition: {
        column: string;
        operator: number;
        values: string[];
    }
}