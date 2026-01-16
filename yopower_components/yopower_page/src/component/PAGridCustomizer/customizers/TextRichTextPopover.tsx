import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { FluentProvider, IdPrefixProvider, webLightTheme, PopoverTrigger, PopoverSurface, Popover } from "@fluentui/react-components";

export function getTextRichTextPopover(cell: ICell): React.ReactElement | null | undefined {
    if (cell.col.dataType !== "RichText") return null;

    return cell.props.value ? (
        <div
            style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                paddingLeft: "5px"
            }}
        >
            <IdPrefixProvider value={cell.table + cell.id + cell.col.colId}>
                <FluentProvider theme={webLightTheme}>
                    <Popover withArrow>
                        <PopoverTrigger disableButtonEnhancement>
                            <div style={{ background: "transparent", width: 0 }}>
                                {
                                    new DOMParser()
                                        .parseFromString(cell.props.value, "text/html")
                                        .body.textContent
                                }
                            </div>
                        </PopoverTrigger>
                        <PopoverSurface tabIndex={-1}>
                            <div
                                style={{ marginTop: 0 }}
                                dangerouslySetInnerHTML={{ __html: cell.props.value }}
                            />
                        </PopoverSurface>
                    </Popover>
                </FluentProvider>
            </IdPrefixProvider>
        </div>
    ) : (
        null
    );
}