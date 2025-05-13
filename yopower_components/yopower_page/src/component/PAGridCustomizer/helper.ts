import { IInputs } from "./generated/ManifestTypes";
import { CustomColumnDefinition } from "./models/CustomColumnDefinition";
import { ColumnDefinition, GetEditorParams, GetRendererParams, RowData } from "./types";

export class Helper {
    public static getDefinition(
        definitions: CustomColumnDefinition[],
        table: string,
        column: string,
        rowData: RowData
    ) {
        const conditions: Record<number, (value: number, values: number[]) => boolean> = {
            1: (value, values) => value === values[0],
            2: (value, values) => value !== values[0],
            3: (value, values) => values.some(k => k === value),
            4: (value, values) => !values.some(k => k === value),
            5: (value, values) => value > values[0],
            6: (value, values) => value >= values[0],
            7: (value, values) => value < values[0],
            8: (value, values) => value <= values[0],
        };

        const matches = definitions.filter(f => f.table === table && f.column === column);

        if (matches.length === 0) return null;

        const sortedMatches = matches.sort((a, b) => (a.condition === null ? 1 : b.condition === null ? -1 : 0));

        for (const definition of sortedMatches) {
            if (definition.condition !== null) {
                const conditionColumn = definition.condition.column;
                const foundColumn = Object.keys(rowData).find(k => k.includes(conditionColumn));

                if (foundColumn !== undefined) {
                    const operator = definition.condition.operator;
                    const rawValue = (rowData as any)[foundColumn];

                    if (rawValue !== undefined && rawValue !== null) {
                        const value = Number(rawValue);
                        const conditionValues = definition.condition.values.map(Number);

                        if (!isNaN(value) && conditionValues.every(v => !isNaN(v))) {
                            if (conditions[operator]?.(value, conditionValues)) {
                                return definition;
                            }
                        }
                    }
                }
            } else {
                return definition;
            }
        }

        return null;
    }


    public static getValue(rowData: RowData, column: string): string {
        let foundColumn: string | undefined;
        if (!column.includes("."))
            foundColumn = Object.keys(rowData).find(k => k === column);
        else
            foundColumn = Object.keys(rowData).find(k => k.includes(column));

        if (foundColumn !== undefined) {
            return (rowData as any)[foundColumn] as string;
        }

        return "";
    }

    public static getFilteredLookupValue(params: any, table: string, col: GetEditorParams | GetRendererParams): any {
        if (params.reference === "row") {
            return {
                table: table,
                id: col.rowData!.__rec_id,
                type: 'Lookup'
            }
        }
        else if (params.reference === "column") {
            let columns = [];
            if (params.column.includes("."))
                columns = col.colDefs.filter(f => f.name.includes(params.column));
            else
                columns = col.colDefs.filter(f => f.name === params.column);

            if (columns.length === 1) {
                const column = columns[0];
                switch (column.dataType) {
                    case "Lookup":
                    case "Customer":
                    case "Persona":
                        const lookup = (col.rowData as any)[column.name];
                        if (lookup)
                            return {
                                table: lookup.etn,
                                id: lookup.id.guid ?? lookup.id,
                                type: 'Lookup'
                            }
                        else
                            return null;
                        break;

                    default:
                        return {
                            value: (col.rowData as any)[column.name] as string
                        };
                        break;
                }
            }
        }
        else
            return null;
    }

    public static buildFilter(filter: string, reference: any): any {
        switch (reference.type) {
            case 'Lookup':
                filter = filter.replace("#valuetype#", reference.table);
                filter = filter.replace("#value#", reference.id);
                return filter;

            default:
                filter = filter.replace("#value#", reference.id);
                break;
        }
    }

    public static navigateToRecordModal(position: number, tableLogicalName: string, id: string, formId: string, tabName: string, height: any, width: any) {
        (window as any).Xrm.Navigation.navigateTo(
            {
                pageType: "entityrecord",
                entityName: tableLogicalName,
                entityId: id,
                formId: formId,
                tabName: tabName
            },
            {
                target: 2,
                height: height,
                width: width,
                position: position,
            }
        )
    }

    public static navigateToViewModal(tableLogicalName: string, viewId: string) {
        (window as any).Xrm.Navigation.navigateTo(
            {
                pageType: "entitylist",
                entityName: tableLogicalName,
                viewId: viewId,
                viewType: "userquery"
            },
            {
                target: 2,
                position: 1,
            }
        )
    }

    public static async navigateToPane(tableLogicalName: string, id: string, formId: string, imageSrc: string, paneId: string, canClose: boolean, hideHeader: boolean, width: any) {

        const pane = (window as any).Xrm.App.sidePanes.getPane(paneId) ?? await (window as any).Xrm.App.sidePanes.createPane({
            paneId: paneId,
            canClose: canClose,
            imageSrc: imageSrc,
            hideHeader: hideHeader,
            width: width
        });
        pane.navigate({
            pageType: "entityrecord",
            entityName: tableLogicalName,
            entityId: id,
            formId: formId
        });
    }

    public static async newRecord(context: ComponentFramework.Context<IInputs>, source: any, targetTableLogicalName: string, formId: string, useQuickCreateForm: boolean, height: any, width: any) {
        var entityFormOptions: any = {};
        entityFormOptions["entityName"] = targetTableLogicalName;
        entityFormOptions["useQuickCreateForm"] = useQuickCreateForm;
        entityFormOptions["openInNewWindow"] = true;
        entityFormOptions["navbar"] = "entity";
        entityFormOptions["formId"] = formId;
        entityFormOptions["createFromEntity"] = {
            entityType: source.entityType,
            id: source.id
        }
        entityFormOptions["height"] = height;
        entityFormOptions["width"] = width;

        var formParameters: any = {};

        context.navigation.openForm(entityFormOptions, formParameters).then(
            (_: any) => {
                const x = 1;
            },
            (_: any) => {
                const x = 2;
            });
    }

    public static goToDefinitions(id: string) {
        (window as any).Xrm.Navigation.navigateTo(
            {
                pageType: "entityrecord",
                entityName: "yp_pagridextd_column_definition",
                entityId: id,
            },
            {
                target: 2,
                height: {
                    value: 80,
                    unit: "%"
                },
                width: {
                    value: 70,
                    unit: "%"
                },
                position: 1,
            }
        ).then((_: any) => {
            window.location.reload();
            // const pageType = (window as any).Xrm.Utility.getPageContext().input;
            // if (pageType === "entitylist") {
            //     (window as any).Xrm.Utility.refreshParentGrid({});
            // }
        });
    }
}