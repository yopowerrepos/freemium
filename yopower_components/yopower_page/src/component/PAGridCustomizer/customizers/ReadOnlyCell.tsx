import * as React from "react";
import { ICell } from "../interfaces/ICell";

export function getReadOnlyCell(cell: ICell): React.ReactElement | null | undefined {
    return <p
        style={{
            padding: 5,
            borderRadius: 5,
            textAlign: "left",
        }}
        onKeyDown={(e) => { e.preventDefault() }}
        onClick={(e) => { e.preventDefault(); return; }}>
        {cell.props.formattedValue}
    </p>
}