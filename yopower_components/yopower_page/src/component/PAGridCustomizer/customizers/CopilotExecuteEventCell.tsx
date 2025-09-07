import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { v4 as uuidv4 } from "uuid";
import { IInputs } from "../generated/ManifestTypes";
import { Icon } from "@fluentui/react/lib/Icon";
import { CommandButton, IContextualMenuItem, IContextualMenuProps } from "@fluentui/react";
import { ProgressIndicator } from "@fluentui/react/lib/ProgressIndicator";
import { CopilotResponse } from "../models/CopilotResponse";

export const CopilotExecuteEventCell: React.FC<ICell> = (cell) => {
    const [loading, setLoading] = React.useState<boolean>(false);

    const events = JSON.parse(cell.definition.parameters).events as Array<any>;
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
                    (cell.context as any).copilot.executeEvent(m.event, { table: cell.table, id: cell.id, from: cell.subgrid }).then(
                        (_: Array<CopilotResponse>) => {
                            renderAnswer(cell.context, _);
                            setLoading(false);
                        }).catch((_: any) => {
                            setLoading(false);
                            cell.context.navigation.openErrorDialog({ message: _.message });
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
                    onKeyDown={(e) => { cell.definition.settings.editable ? cell.props.startEditing() : e.preventDefault() }}
                    onDoubleClick={(e) => { cell.definition.settings.editable ? cell.props.startEditing() : e.preventDefault() }}>
                    <Icon imageProps={{ src: "/WebResources/msdyn_CopilotIconWithColor.svg", style: { height: 18 } }} style={{ marginRight: 3 }} />
                    <div style={{ height: 20 }}>{item?.text ?? cell.props.formattedValue}</div>
                </div>
            ) : (
                <CommandButton
                    text={cell.props.formattedValue}
                    menuProps={{ items } as IContextualMenuProps}
                    checked={true}
                    iconProps={{ imageProps: { src: "/WebResources/msdyn_CopilotIconWithColor.svg", style: { height: 18 } } }}
                    onDoubleClick={(e) => { e.preventDefault(); }} />
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
