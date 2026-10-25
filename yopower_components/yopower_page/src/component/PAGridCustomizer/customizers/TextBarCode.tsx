import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { FluentProvider, IdPrefixProvider, webLightTheme, PopoverTrigger, PopoverSurface, Popover, Button } from "@fluentui/react-components";
import { Icon } from "@fluentui/react";
import ReactBarcode, { BarcodeProps, Options } from "react-barcode";
import { CodeErrorBoundary } from "./CodeErrorBoundary";
import { _502TextBarCode } from "../models/customizers/_502TextBarCode";
import { parseBarCodeLayout } from "./BarCodeLayouts";
import { CodePartsTable } from "./CodePartsTable";

// react-barcode typings use a default React import (requires esModuleInterop)
const Barcode = ReactBarcode as unknown as React.ComponentType<BarcodeProps>;

// jsbarcode sets fixed width/height attributes plus a viewBox, so CSS can scale it to fit the popover
const fitStyle = ".yp-barcode-fit svg { width: 100%; height: auto; display: block; }";

const getParams = (parameters: any): Partial<_502TextBarCode> => {
    try {
        return ((typeof parameters === "string" ? JSON.parse(parameters) : parameters) ?? {}) as _502TextBarCode;
    } catch {
        return {};
    }
};

export const TextBarCodeComponent: React.FC<ICell> = (cell) => {
    const [copied, setCopied] = React.useState(false);
    const value: string = cell.props.value ?? "";
    const params = getParams(cell.definition?.parameters);
    const parsed = parseBarCodeLayout(params.layout, value);
    // Explicit format wins, otherwise the layout default (boleto = ITF, GTIN = EAN13...)
    const format = (params.format || parsed?.format || "CODE128") as Options["format"];

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error("Copy to clipboard failed", err);
        }
    };

    if (!value) return null;

    const invalid = <span style={{ color: "#a4262c", fontSize: "12px" }}>Invalid {format} barcode</span>;

    return (
        <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", overflow: "hidden", paddingLeft: "5px" }}>
            <IdPrefixProvider value={cell.table + cell.id + cell.col.colId}>
                <FluentProvider theme={webLightTheme} style={{ background: "transparent", height: "100%", width: "100%", display: "flex", alignItems: "center", gap: "4px", minWidth: 0 }}>
                    <Popover withArrow>
                        <PopoverTrigger disableButtonEnhancement>
                            <span
                                title={value}
                                style={{ flex: 1, minWidth: 0, cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "Consolas, monospace" }}
                            >
                                {value}
                            </span>
                        </PopoverTrigger>
                        <PopoverSurface tabIndex={-1}>
                            <style>{fitStyle}</style>
                            <div className="yp-barcode-fit" style={{ width: "min(600px, 90vw)" }}>
                                <CodeErrorBoundary value={value} fallback={invalid}>
                                    <Barcode value={parsed?.code ?? value} format={format} ean128={parsed?.ean128} renderer="svg" width={2} height={80} margin={8} displayValue={false} />
                                </CodeErrorBoundary>
                                {parsed && <CodePartsTable parts={parsed.parts} valueHeader={parsed.format === "CODE128" ? "Value" : "Digits"} />}
                            </div>
                        </PopoverSurface>
                    </Popover>
                    <Button
                        appearance="subtle"
                        size="small"
                        icon={<Icon iconName={copied ? "CheckMark" : "Copy"} />}
                        title="Copy"
                        onClick={handleCopy}
                    />
                </FluentProvider>
            </IdPrefixProvider>
        </div>
    );
};
