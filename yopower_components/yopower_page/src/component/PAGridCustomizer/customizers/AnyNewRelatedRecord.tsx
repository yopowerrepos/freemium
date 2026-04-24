import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { Helper } from "../helper";
import { CommandButton, IContextualMenuItem, IContextualMenuProps } from "@fluentui/react";
import { _905AnyNewRelatedRecord } from "../models/customizers/_905AnyNewRelatedRecord";

export function getAnyNewRelatedRecord(cell: ICell): React.ReactElement | null | undefined {
    let items = new Array<IContextualMenuItem>();
    const params = JSON.parse(cell.definition.parameters) as _905AnyNewRelatedRecord;
    const options = params.options;
    if (options !== null && options.length > 0) {
        items = items.concat(options.map(o => {
            return {
                iconProps: { iconName: o.icon! },
                key: o.label,
                text: o.label,
                onClick: (e: any) => {
                    Helper.newRecord(cell.context, { entityType: cell.table, id: cell.id }, o.targetTableLogicalName, o.formId, o.useQuickCreateForm, o.height, o.width);
                }
            } as IContextualMenuItem
        }));
    }

    let navigateToProps: IContextualMenuProps = {
        items: items
    };

    return (
        <CommandButton
            text={cell.props.formattedValue}
            menuProps={navigateToProps}
            checked={false}
            iconProps={{ iconName: "Add" }}
            onKeyDown={(e) => { cell.definition.settings.editable ? cell.props.startEditing() : e.preventDefault() }}
            onDoubleClick={(e) => { cell.definition.settings.editable ? cell.props.startEditing() : e.preventDefault() }} />
    );
}
