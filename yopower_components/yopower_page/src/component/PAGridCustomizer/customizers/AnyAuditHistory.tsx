import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { IInputs } from "../generated/ManifestTypes";
import { Button, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from "@fluentui/react-components";
import { AuditDetail } from "../models/common/AuditDetail";
import { Icon } from "@fluentui/react";

export const AnyAuditHistory: React.FC<ICell> = (cell) => {

    const [data, setOldData] = React.useState<AuditDetail[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);

    const handleButtonClick = async () => {
        setLoading(true);
        const oldValues = await getOldValues(cell.context, cell.table, cell.id, cell.col.name);
        setOldData(oldValues);
        setLoading(false);
    };

    return (
        <Menu>
            <MenuTrigger>
                <div
                    title={cell.overrideFormattedValue !== "" ? cell.overrideFormattedValue! : cell.props.formattedValue!}
                    style={{
                        padding: "4px 8px",
                        borderRadius: 2,
                        textAlign: "center",
                        background: "transparent",
                        color: "black",
                        lineHeight: "20px",
                        display: "flex",
                        margin: "4px"
                    }}
                    onKeyDown={(e) => { cell.definition.settings.editable ? cell.props.startEditing() : e.preventDefault() }}
                    onDoubleClick={(e) => { cell.definition.settings.editable ? cell.props.startEditing() : e.preventDefault() }}
                    onClick={(e) => { handleButtonClick(); }}>
                    <Icon iconName="History" style={{ marginRight: 3 }} />
                    <div style={{ height: 20 }}>
                        {cell.props.formattedValue}
                    </div>
                </div>
            </MenuTrigger>
            <MenuPopover
                style={{
                    background: "#ffffff",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                    borderRadius: 6,
                    padding: 8,
                    minWidth: "400px",
                    width: "100%"
                }}>
                <MenuList style={{ background: "#ffffff", padding: 0, margin: 0 }}>
                    {loading ? (
                        <MenuItem disabled style={{ pointerEvents: "none" }}>Loading...</MenuItem>
                    ) : data.length > 0 ? data.map((item, index) => (
                        <MenuItem key={index}>
                            <span
                                title={item.value}
                                style={{
                                    color: item.color,
                                    display: "inline-block",
                                    whiteSpace: "nowrap",
                                    textWrap: "wrap",
                                    width: "100%"
                                }}>
                                <b>{item.formattedValue}</b>
                            </span>
                            <span
                                style={{
                                    color: "#000000",
                                    display: "inline-block",
                                    whiteSpace: "nowrap",
                                    textWrap: "wrap",
                                    width: "100%"
                                }}>
                                <i>{item.user} on {item.modifiedOn}</i>
                            </span>
                        </MenuItem>
                    )) : <MenuItem disabled>No audit data available</MenuItem>}
                </MenuList>
            </MenuPopover>
        </Menu>
    );
}

export function getOldValues(context: ComponentFramework.Context<IInputs>, table: string, id: string, column: string): Promise<AuditDetail[]> {
    const request = {
        table: table,
        id: { guid: id },
        column: column,

        getMetadata: function () {
            return {
                boundParameter: null,
                parameterTypes: {
                    table: { typeName: "Edm.String", structuralProperty: 1 },
                    id: { typeName: "Edm.Guid", structuralProperty: 1 },
                    column: { typeName: "Edm.String", structuralProperty: 1 }
                },
                operationType: 0, operationName: "yp_get_column_audit_history"
            };
        }
    };

    return (context.webAPI as any).execute(request).then(
        (_: any) => {
            if (_.ok) { return _.json(); }
        }).then((_: any) => {
            const data = _["data"];
            if (data && data.length > 0)
                return JSON.parse(data) as AuditDetail[];
            else
                return new Array<AuditDetail>();
        }).catch((_: any) => {
            console.log(_.message);
            return new Array<AuditDetail>();
        });
}