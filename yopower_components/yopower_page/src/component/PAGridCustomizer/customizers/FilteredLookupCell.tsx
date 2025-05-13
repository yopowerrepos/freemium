import * as React from "react";
import { ColumnDefinition, GetEditorParams, GetRendererParams } from "../types";
import { Helper } from "../helper";
import { IInputs } from "../generated/ManifestTypes";

export function getFilteredLookupCell(
    context: ComponentFramework.Context<IInputs>,
    editor: GetEditorParams,
    col: ColumnDefinition,
    props: any,
    definition: any,
    table: string,
    id: string
): React.ReactElement | null | undefined {
    if (col.dataType === "Lookup"
        || col.dataType === "Customer") {
        const params = JSON.parse(definition.parameters);
        openLookup(params, table, props, editor, context);
        return <div
            style={{
                padding: 5,
                borderRadius: 5,
                textAlign: "center",
            }}>
            {props.formattedValue}
        </div>
    }
}

export function openLookup(params: any, table: string, props: any, col: GetEditorParams, context: ComponentFramework.Context<IInputs>) {
    // Get Referece Column
    const reference = Helper.getFilteredLookupValue(params, table, col);

    if (reference !== null) {
        // Build Filter
        const filter = Helper.buildFilter(params.filter, reference);

        // Get Table (Manage Polymorphic)
        let tables: string[] = new Array<string>();
        if (props.value)
            tables = [props.value.etn];
        else
            tables = (col.colDefs[col.columnIndex] as any).customizerParams.targets;

        // Open Lookup
        let options: any = {
            allowMultiSelect: false,
            entityTypes: tables,
            filters: [{ filterXml: filter, entityLogicalName: tables[0] }]
        };

        if (params.viewId !== null && params.viewId !== "00000000-0000-0000-0000-000000000000") {
            options.viewIds = [params.viewId];
            options.defaultViewId = params.viewId;
        }

        context.utils.lookupObjects(options).then(
            (_: ComponentFramework.LookupValue[]) => {
                const record = _[0] as ComponentFramework.LookupValue;
                if (record) {
                    col.onCellValueChanged(
                        {
                            etn: record.entityType,
                            id: { guid: record.id },
                            name: record.name
                        });
                    col.stopEditing();
                }
                else
                    col.stopEditing();
            },
            (_: any) => { col.stopEditing(); });

        (col as any).eGridCell.blur();

        const checkForElement = () => {
            let lookupDialog = window.document.getElementById("lookupDialogRoot");
            if (lookupDialog)
                lookupDialog.style.zIndex = "1";
            else
                clearInterval(intervalId);
        };

        // Check every 500 milliseconds
        const intervalId = setInterval(checkForElement, 500);
    }
    else
        col.stopEditing();
}