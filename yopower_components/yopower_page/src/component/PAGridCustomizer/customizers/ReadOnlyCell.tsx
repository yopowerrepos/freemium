import * as React from "react";
import { ColumnDefinition, GetEditorParams, GetRendererParams } from "../types";
import { IInputs } from "../generated/ManifestTypes";

export function getReadOnlyCell(
    context: ComponentFramework.Context<IInputs>,
    agnostic: GetRendererParams | GetEditorParams,
    col: ColumnDefinition,
    props: any,
    definition: any,
    table: string,
    id: string,
    goToSettings: (e: any) => void
): React.ReactElement | null | undefined {
    return <p
        style={{
            padding: 5,
            borderRadius: 5,
            textAlign: "left",
        }}
        onKeyDown={(e) => { e.preventDefault() }}
        onClick={(e) => { e.preventDefault(); return; }}
        onMouseDown={(e) => { goToSettings(e) }} >
        {props.formattedValue}
    </p>
}