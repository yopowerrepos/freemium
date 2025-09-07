import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { Helper } from "../helper";
import { CommandButton, IContextualMenuItem, IContextualMenuProps } from "@fluentui/react";

export function getLookupNavigateButtonsCell(cell: ICell): React.ReactElement | null | undefined {
    if (cell.col.dataType === "Lookup"
        || cell.col.dataType === "Customer") {

        let items = new Array<IContextualMenuItem>();
        const modal = JSON.parse(cell.definition.parameters).modal as Array<any>;
        const sidePane = JSON.parse(cell.definition.parameters).sidePane as Array<any>;

        // Get Table (Manage Polymorphic)
        if (cell.props.value) {
            if (modal !== null && modal.length > 0) {
                items = items.concat(modal.map(m => {
                    return {
                        key: m.label,
                        text: m.label,
                        onClick: (e: any) => {
                            Helper.navigateToRecordModal(m.position, cell.props.value.etn, cell.props.value.id.guid ?? cell.props.value.id, m.formId, m.tabName, m.height, m.width)
                        }
                    } as IContextualMenuItem
                }));
            }
            if (sidePane !== null && sidePane.length > 0) {
                items = items.concat(sidePane.map(m => {
                    return {
                        key: m.label,
                        text: m.label,
                        onClick: (e: any) => {
                            Helper.navigateToPane(cell.props.value.etn, cell.props.value.id.guid ?? cell.props.value.id, m.formId, m.imageSrc, m.paneId, m.canClose, m.hideHeader, m.width)
                        }
                    } as IContextualMenuItem
                }));
            }

            let navigateToProps: IContextualMenuProps = {
                items: items
            };

            if (navigateToProps.items.length === 1) {
                const item = navigateToProps.items[0];
                return <div
                    style={{
                        padding: "4px 8px",
                        borderRadius: 2,
                        textAlign: "left",
                        background: "transparent",
                        color: "#115EA3",
                        lineHeight: "20px",
                        display: "flex",
                        margin: "4px",
                        cursor: "pointer"
                    }}
                    onKeyDown={(e) => { cell.definition.settings.editable ? cell.props.startEditing() : e.preventDefault() }}
                    onClick={
                        item.onClick
                    }>
                    <div style={{ height: 20 }}>
                        {cell.props.formattedValue}
                    </div>
                </div>;
            }
            else {
                return (
                    <CommandButton
                        text={cell.props.formattedValue}
                        menuProps={navigateToProps}
                        checked={false}
                        iconProps={{ iconName: "View" }}
                        onKeyDown={(e) => { cell.definition.settings.editable ? cell.props.startEditing() : e.preventDefault() }}
                        onDoubleClick={(e) => { cell.definition.settings.editable ? cell.props.startEditing() : e.preventDefault() }} />
                );
            }
        }
    }
}