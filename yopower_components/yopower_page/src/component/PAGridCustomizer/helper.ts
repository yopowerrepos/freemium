import { ModifierState } from "./ControlKeyTracker";
import { IInputs } from "./generated/ManifestTypes";
import { CustomColumnDefinition } from "./models/CustomColumnDefinition";
import { ColumnDefinition, GetEditorParams, GetRendererParams, RowData } from "./types";

export class Helper {
    /**
     * Returns the first matching column definition based on:
     * - Table and column match
     * - Optional modifier key state (Ctrl, Alt, Shift, or none)
     * - Optional conditional logic on a value in the row
     *
     * Matching priority:
     *  1. Try to match definitions with the current modifier key (`shortcut`)
     *  2. If none match, fallback to all definitions (sorted by condition presence)
     *  3. Within matches, evaluate condition logic if present
     * 
     * @param definitions List of available column definitions
     * @param table Logical name of the table to match
     * @param column Logical name of the column to match
     * @param rowData The row being rendered (for condition evaluation)
     * @param modifiers Optional current modifier state (Ctrl/Alt/Shift/null)
     * @returns A matching definition or null
     */
    public static getDefinition(
        definitions: CustomColumnDefinition[],
        table: string,
        column: string,
        rowData: RowData,
        modifiers: ModifierState | null = null
    ) {
        // Operator logic mapping (condition.type → comparison function)
        const conditions: Record<number, (value: number, values: number[]) => boolean> = {
            1: (value, values) => value === values[0],                         // equals
            2: (value, values) => value !== values[0],                        // not equals
            3: (value, values) => values.some(k => k === value),             // in
            4: (value, values) => !values.some(k => k === value),            // not in
            5: (value, values) => value > values[0],                         // greater than
            6: (value, values) => value >= values[0],                        // greater or equal
            7: (value, values) => value < values[0],                         // less than
            8: (value, values) => value <= values[0],                        // less or equal
        };

        // Step 1: filter definitions that match the current table and column
        const matches = definitions.filter(f => f.table === table && f.column === column);
        if (matches.length === 0) return null;

        let sortedMatches: CustomColumnDefinition[] = [];

        // Step 2: filter matches that match the active modifier shortcut
        // (using translateModifierState to convert ModifierState to shortcut number)
        sortedMatches = matches.filter(f => f.shortcut === this.translateModifierState(modifiers));

        // Step 3: if no modifier-specific matches found, fallback to full set
        // Sort so definitions with conditions come before unconditional ones
        if (sortedMatches.length !== 0)
            sortedMatches = sortedMatches.sort((a, b) => (a.condition === null ? 1 : b.condition === null ? -1 : 0));
        else
            sortedMatches = matches.filter(f => f.shortcut === -1).sort((a, b) => (a.condition === null ? 1 : b.condition === null ? -1 : 0));

        // Step 4: evaluate each sorted definition’s condition (if present)
        for (const definition of sortedMatches) {
            if (definition.condition !== null) {
                const conditionColumn = definition.condition.column;

                // Try to locate the condition column in rowData (partial match allows for aliased keys)
                const foundColumn = Object.keys(rowData).find(k => k.includes(conditionColumn));

                if (foundColumn !== undefined) {
                    const operator = definition.condition.operator;
                    const rawValue = (rowData as any)[foundColumn];

                    // Ensure the condition value is valid and numeric
                    if (rawValue !== undefined && rawValue !== null) {
                        const value = Number(rawValue);
                        const conditionValues = definition.condition.values.map(Number);

                        // If the value and all condition values are numbers, evaluate condition
                        if (!isNaN(value) && conditionValues.every(v => !isNaN(v))) {
                            if (conditions[operator]?.(value, conditionValues)) {
                                return definition; // ✅ matching condition
                            }
                        }
                    }
                }
            } else {
                // No condition to evaluate — return immediately as a default match
                return definition;
            }
        }

        // No definition matched after condition evaluation
        return null;
    }

    /**
     * Translates the current modifier key state into a numeric code.
     * Returns:
     *   1 → Ctrl pressed exclusively
     *   2 → Alt pressed exclusively
     *   3 → Shift pressed exclusively
     *  -1 → No modifier or multiple modifiers pressed
     *
     * @param state The current ModifierState or null
     * @returns A numeric representation of the active modifier
     */
    private static translateModifierState(state: ModifierState | null): number {
        // If no state provided, treat as no modifier
        if (!state) return -1;

        const { ctrl, shift } = state;

        // Count how many modifiers are active (true)
        const active = [ctrl, shift].filter(Boolean).length;

        // If more than one key is pressed, return -1 (unsupported combination)
        if (active > 1) return -1;

        // Map single active modifier to numeric code
        if (ctrl) return 1;
        if (shift) return 2;

        // No modifier pressed
        return -1;
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

    public static buildTimelineQuery(item: any, reference: any): any {

        return `<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
                        <entity name='${item.table}'>
                            <attribute name='${item.id}' />
                            <attribute name='${item.title}' />
                            <attribute name='${item.description}' />
                            <attribute name='${item.optionset}' />
                            <attribute name='${item.orderby}' />
                            <filter type='and'>
                            <condition attribute='${item.lookup}' operator='eq' uitype='${reference.table}' value='${reference.id}'/>
                            </filter>
                        </entity>
                        </fetch>`;
    }

    public static navigateToRecordModal(position: number, tableLogicalName: string, id: string, formId: string, tabName: string | undefined, height: any, width: any) {
        const pageInput: any = {
            pageType: "entityrecord",
            entityName: tableLogicalName,
            entityId: id,
            formId: formId,
            tabName: tabName
        };
        const navigationOptions: any = {
            target: 2,
            height: height,
            width: width,
            position: position,
        };
        (window as any).Xrm.Navigation.navigateTo(
            pageInput,
            navigationOptions
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

        let pane = (window as any).Xrm.App.sidePanes.getPane(paneId);
        if (pane)
            await pane.close();

        pane = await (window as any).Xrm.App.sidePanes.createPane({
            paneId: paneId,
            canClose: canClose,
            imageSrc: imageSrc,
            hideHeader: hideHeader,
            isSelected: true,
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