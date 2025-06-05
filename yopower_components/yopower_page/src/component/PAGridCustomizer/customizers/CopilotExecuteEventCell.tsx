import * as React from "react";
import { ColumnDefinition, GetRendererParams } from "../types";
import { IInputs } from "../generated/ManifestTypes";
import { Icon } from "@fluentui/react/lib/Icon";
import { CommandButton, IContextualMenuItem, IContextualMenuProps } from "@fluentui/react";
import { ProgressIndicator } from "@fluentui/react/lib/ProgressIndicator";
import { CopilotResponse } from "../models/CopilotResponse";
import { v4 as uuidv4 } from "uuid";

interface CopilotExecuteEventCellProps {
    context: ComponentFramework.Context<IInputs>;
    editor: GetRendererParams;
    col: ColumnDefinition;
    props: any;
    definition: any;
    table: string;
    id: string;
    subgrid: string;
    goToSettings: (e: any) => void;
}

export const CopilotExecuteEventCell: React.FC<CopilotExecuteEventCellProps> = ({
    context,
    editor,
    col,
    props,
    definition,
    table,
    id,
    subgrid,
    goToSettings
}) => {
    const [loading, setLoading] = React.useState<boolean>(false);

    const events = JSON.parse(definition.parameters).events as Array<any>;
    let items = new Array<IContextualMenuItem>();

    if (events && events.length > 0) {
        items = items.concat(events.map(m => {
            return {
                iconProps: { iconName: m.icon },
                key: m.label,
                text: m.label,
                title: m.tooltip,
                onClick: (e: any) => {
                    setLoading(true);
                    (context as any).copilot.executeEvent(m.event, { table: table, id: id, from: subgrid }).then(
                        (_: Array<CopilotResponse>) => {
                            renderAnswer(context, _);
                            setLoading(false);
                        }).catch((_: any) => {
                            setLoading(false);
                            context.navigation.openErrorDialog({ message: _.message });
                        });
                }
            } as IContextualMenuItem
        }));
    }

    const onlyOne = items.length === 1;
    const item = onlyOne ? items[0] : null;

    return (
        <div>
            {loading ? (
                <ProgressIndicator
                    styles={{ root: { width: "100%", marginTop: 6 } }}
                />
            ) : onlyOne ? (
                <div
                    style={{
                        padding: "4px 8px",
                        borderRadius: 2,
                        textAlign: "center",
                        background: "transparent",
                        color: "black",
                        lineHeight: "20px",
                        display: "flex",
                        flexDirection: "column",
                        margin: "4px",
                        cursor: "pointer",
                        alignItems: "center"
                    }}
                    onClick={item?.onClick}
                    onKeyDown={(e) => { definition.settings.editable ? props.startEditing() : e.preventDefault() }}
                    onDoubleClick={(e) => { definition.settings.editable ? props.startEditing() : e.preventDefault() }}
                    onMouseDown={(e) => { goToSettings(e) }}
                >
                    <Icon imageProps={{ src: "/WebResources/msdyn_CopilotIconWithColor.svg", style: { height: 18 } }} style={{ marginRight: 3 }} />
                    <div style={{ height: 20 }}>{item?.text ?? props.formattedValue}</div>
                </div>
            ) : (
                <CommandButton
                    text={props.formattedValue}
                    menuProps={{ items } as IContextualMenuProps}
                    checked={true}
                    iconProps={{ imageProps: { src: "/WebResources/msdyn_CopilotIconWithColor.svg", style: { height: 18 } } }}
                    onDoubleClick={(e) => { e.preventDefault(); }}
                    onMouseDown={(e) => { goToSettings(e); }}
                />
            )}
        </div>
    );
};

export async function renderAnswer(context: ComponentFramework.Context<IInputs>, response: Array<CopilotResponse>): Promise<void> {
    const instanceId = "yp.page." + uuidv4();
    localStorage.setItem(instanceId, JSON.stringify({ value: response, expiry: Date.now() + 5000 }));
    navigateToCopilotPane(context, instanceId, true, 600);
}

export function navigateToCopilotPane(context: ComponentFramework.Context<IInputs>, instanceId: string, canClose: boolean, width: number) {
    (window as any).Xrm.App.sidePanes.createPane({
        paneId: instanceId,
        canClose,
        imageSrc: "/WebResources/msdyn_CopilotIconWithColor.svg",
        hideHeader: true,
        width
    }).then((pane: any) => {
        pane.navigate({
            pageType: "webresource",
            webresourceName: "yp_copilot_renderer",
            data: encodeURIComponent(instanceId)
        });
    });
}
