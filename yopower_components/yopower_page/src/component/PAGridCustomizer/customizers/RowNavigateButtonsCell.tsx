import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { Helper } from "../helper";
import { CommandButton, IContextualMenuItem, IContextualMenuProps } from "@fluentui/react";

export function getRowNavigateButtonsCell(cell: ICell): React.ReactElement | null | undefined {

    let items = new Array<IContextualMenuItem>();
    const modal = JSON.parse(cell.definition.parameters).modal as Array<any>;
    const sidePane = JSON.parse(cell.definition.parameters).sidePane as Array<any>;
    if (modal !== null && modal.length > 0) {
        items = items.concat(modal.map(m => {
            return {
                iconProps: { iconName: m.icon! },
                key: m.label,
                text: m.label,
                onClick: (e: any) => {
                    Helper.navigateToRecordModal(m.position, cell.table, cell.id, m.formId, m.tabName!, m.height, m.width)
                }
            } as IContextualMenuItem
        }));
    }
    if (sidePane !== null && sidePane.length > 0) {
        items = items.concat(sidePane.map(m => {
            return {
                iconProps: { iconName: m.icon! },
                key: m.label,
                text: m.label,
                onClick: (e: any) => {
                    Helper.navigateToPane(cell.table, cell.id, m.formId, m.imageSrc, m.paneId, m.canClose, m.hideHeader, m.width)
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
                {item.label ?? cell.props.formattedValue}
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