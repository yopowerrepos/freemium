import * as React from "react";
import { ColumnDefinition, GetRendererParams } from "../types";
import { CommandButton, IContextualMenuItem, IContextualMenuProps } from "@fluentui/react";
import { Helper } from "../helper";
import { IInputs } from "../generated/ManifestTypes";

export function getNewRelatedRecordCell(
    context: ComponentFramework.Context<IInputs>,
    render: GetRendererParams,
    col: ColumnDefinition,
    props: any,
    definition: any,
    table: string,
    id: string,
    goToSettings: (e: any) => void

): React.ReactElement | null | undefined {
    let items = new Array<IContextualMenuItem>();
    const options = JSON.parse(definition.parameters).options as Array<any>;
    if (options !== null && options.length > 0) {
        items = items.concat(options.map(o => {
            return {
                iconProps: { iconName: o.icon! },
                key: o.label,
                text: o.label,
                onClick: (e: any) => {
                    Helper.newRecord(context, { entityType: table, id: id }, o.targetTableLogicalName, o.formId, o.useQuickCreateForm, o.height, o.width);
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
            iconProps={{ iconName: "Add" }}
            onKeyDown={(e) => { definition.settings.editable ? props.startEditing() : e.preventDefault() }}
            onDoubleClick={(e) => { definition.settings.editable ? props.startEditing() : e.preventDefault() }}
            onMouseDown={(e) => { goToSettings(e) }} />
    );
}
