import * as React from "react";
import { ICell } from "../interfaces/ICell";

export function getAnyColorByHex(cell: ICell): React.ReactElement | null | undefined {
    const formattedValue = (cell.overrideFormattedValue !== "" ? cell.overrideFormattedValue : cell.props.formattedValue);
    return formattedValue !== null && formattedValue !== undefined && formattedValue !== ""
        ? <p style={{
            padding: 5,
            borderRadius: 5,
            textAlign: "left",
            background: cell.props.value as string
        }}
            onKeyDown={(e) => { e.preventDefault() }}
            onClick={(e) => { e.preventDefault(); return; }}>
            {formattedValue}
        </p>
        : null
}