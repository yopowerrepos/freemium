import * as React from "react";
import { ColumnDefinition } from "../types";
import { CommandButton, IContextualMenuItem, IContextualMenuProps } from "@fluentui/react";
import { Helper } from "../helper";

export function getRowNavigateButtonsCel(col: ColumnDefinition, props: any, definition: any, table: string, id: string): React.ReactElement | null | undefined {
    let items = new Array<IContextualMenuItem>();
    const modal = JSON.parse(definition.parameters).modal as Array<any>;
    const sidePane = JSON.parse(definition.parameters).sidePane as Array<any>;
    if (modal !== null && modal.length > 0) {
        items = items.concat(modal.map(m => {
            return {
                key: m.label,
                text: m.label,
                onClick: (e: any) => {
                    Helper.navigateToModal(m.position, table, id, m.formId, m.height, m.width)
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
                    Helper.navigateToPane(table, id, m.formId, m.imageSrc, m.paneId, m.canClose, m.hideHeader, m.width)
                }
            } as IContextualMenuItem
        }));
    }

    let navigateToProps: IContextualMenuProps = {
        items: items
    };

    return (
        <CommandButton
            text={props.formattedValue}
            menuProps={navigateToProps}
            checked={false}
            iconProps={undefined}
            onClick={(e) => { navigateToProps.items[0].onClick }}
            onDoubleClick={(e) => { props.startEditing() }} />
    );
}
