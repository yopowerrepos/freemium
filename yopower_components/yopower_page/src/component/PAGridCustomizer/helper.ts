import { CustomColumnDefinition } from "./models/CustomColumnDefinition";
import { ColumnDefinition, GetEditorParams, GetRendererParams } from "./types";

export class Helper {
    public static getDefinition(definitions: CustomColumnDefinition[], table: string, column: string) {
        const match = definitions.filter(f => f.table === table && f.column === column);
        if (match.length === 1)
            return match[0];
        else
            return null;
    }

    public static getFilteredLookupValue(params: any, table: string, col: GetEditorParams | GetRendererParams): any {
        let reference = {};
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

    public static navigateToModal(position: number, tableLogicalName: string, id: string, formId: string, height: any, width: any) {
        (window as any).Xrm.Navigation.navigateTo(
            {
                pageType: "entityrecord",
                entityName: tableLogicalName,
                entityId: id
            },
            {
                target: 2,
                height: height,
                width: width,
                position: position,
                formId: formId
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
}