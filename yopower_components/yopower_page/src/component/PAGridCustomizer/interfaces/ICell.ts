import { IInputs } from "../generated/ManifestTypes";
import { ColumnDefinition, GetEditorParams, GetRendererParams } from "../types";

export interface ICell {
    context: ComponentFramework.Context<IInputs>;
    params: GetRendererParams | GetEditorParams;
    col: ColumnDefinition;
    props: any;
    definition: any;
    table: string;
    id: string;
    subgrid: string;
    overrideFormattedValue: string | null;
}