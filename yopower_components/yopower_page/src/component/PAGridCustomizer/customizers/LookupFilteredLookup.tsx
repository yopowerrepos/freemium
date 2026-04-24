import * as React from "react";
import { GetEditorParams } from "../types";
import { Helper } from "../helper";
import { IInputs } from "../generated/ManifestTypes";
import { ICell } from "../interfaces/ICell";
import { _801LookupFilteredLookup } from "../models/customizers/_801LookupFilteredLookup";

export function getLookupFilteredLookup(cell: ICell): React.ReactElement | null | undefined {
    if (cell.col.dataType === "Lookup"
        || cell.col.dataType === "Customer") {
        const params = JSON.parse(cell.definition.parameters) as _801LookupFilteredLookup;
        openLookup(params, cell.table, cell.props, cell.params as GetEditorParams, cell.context);
        return <div
            style={{
                padding: 5,
                borderRadius: 5,
                textAlign: "center",
            }}>
            {cell.props.formattedValue}
        </div>
    }
}

export function openLookup(params: _801LookupFilteredLookup, table: string, props: any, col: GetEditorParams, context: ComponentFramework.Context<IInputs>) {
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