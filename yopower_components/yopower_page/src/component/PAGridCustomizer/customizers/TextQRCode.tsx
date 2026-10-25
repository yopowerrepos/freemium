import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { FluentProvider, IdPrefixProvider, webLightTheme, PopoverTrigger, PopoverSurface, Popover } from "@fluentui/react-components";
import { QRCodeSVG } from "qrcode.react";
import { CodeErrorBoundary } from "./CodeErrorBoundary";
import { _501TextQRCode } from "../models/customizers/_501TextQRCode";
import { parseQRCodeLayout } from "./QRCodeLayouts";
import { CodePartsTable } from "./CodePartsTable";

const getParams = (parameters: any): Partial<_501TextQRCode> => {
    try {
        return ((typeof parameters === "string" ? JSON.parse(parameters) : parameters) ?? {}) as _501TextQRCode;
    } catch {
        return {};
    }
};

export const TextQRCodeComponent: React.FC<ICell> = (cell) => {
    const value: string = cell.props.value ?? "";
    const parts = parseQRCodeLayout(getParams(cell.definition?.parameters).layout, value);

    if (!value) return null;

    const invalid = <span style={{ color: "#a4262c", fontSize: "12px" }}>Invalid QR code</span>;

    return (
        <div style={{ height: "100%", display: "flex", alignItems: "center", overflow: "hidden", paddingLeft: "5px" }}>
            <IdPrefixProvider value={cell.table + cell.id + cell.col.colId}>
                <FluentProvider theme={webLightTheme} style={{ background: "transparent", height: "100%", display: "flex", alignItems: "center" }}>
                    <CodeErrorBoundary value={value} fallback={invalid}>
                        <Popover withArrow positioning="after">
                            <PopoverTrigger disableButtonEnhancement>
                                <div style={{ cursor: "pointer", display: "flex", alignItems: "center", height: "100%" }} title={value}>
                                    <QRCodeSVG value={value} size={32} marginSize={0} />
                                </div>
                            </PopoverTrigger>
                            <PopoverSurface tabIndex={-1}>
                                <div style={{ width: parts ? "min(420px, 90vw)" : undefined }}>
                                    <div style={{ padding: "8px", display: "flex", justifyContent: "center" }}>
                                        <QRCodeSVG value={value} size={256} marginSize={2} />
                                    </div>
                                    {parts && <CodePartsTable parts={parts} />}
                                </div>
                            </PopoverSurface>
                        </Popover>
                    </CodeErrorBoundary>
                </FluentProvider>
            </IdPrefixProvider>
        </div>
    );
};
