import * as React from "react";
import { ColumnDefinition, GetRendererParams } from "../types";
import { CommandButton, IContextualMenuItem, IContextualMenuProps } from "@fluentui/react";
import { Helper } from "../helper";
import { IInputs } from "../generated/ManifestTypes";

export function getLookupNavigateButtonsCell(
    context: ComponentFramework.Context<IInputs>,
    render: GetRendererParams,
    col: ColumnDefinition,
    props: any,
    definition: any,
    table: string,
    id: string
): React.ReactElement | null | undefined {
    if (col.dataType === "Lookup"
        || col.dataType === "Customer") {

        let items = new Array<IContextualMenuItem>();
        const modal = JSON.parse(definition.parameters).modal as Array<any>;
        const sidePane = JSON.parse(definition.parameters).sidePane as Array<any>;

        // Get Table (Manage Polymorphic)
        if (props.value) {
            if (modal !== null && modal.length > 0) {
                items = items.concat(modal.map(m => {
                    return {
                        key: m.label,
                        text: m.label,
                        onClick: (e: any) => {
                            Helper.navigateToRecordModal(m.position, props.value.etn, props.value.id.guid ?? props.value.id, m.formId, m.tabName, m.height, m.width)
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
                            Helper.navigateToPane(props.value.etn, props.value.id.guid ?? props.value.id, m.formId, m.imageSrc, m.paneId, m.canClose, m.hideHeader, m.width)
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
                    iconProps={{ iconName: "View" }}
                    onClick={(e) => { navigateToProps.items[0].onClick }}
                    onKeyDown={(e) => { definition.settings.editable ? props.startEditing() : e.preventDefault() }}
                    onDoubleClick={(e) => { definition.settings.editable ? props.startEditing() : e.preventDefault() }} />
            );
        }
    }
}