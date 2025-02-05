import * as React from "react";
import { ColumnDefinition } from "../types";

export function getReadOnlyCel(col: ColumnDefinition, props: any, definition: any): React.ReactElement | null | undefined {
    return <p
        style={{
            padding: 5,
            borderRadius: 5,
            textAlign: "center",
        }}
        onClick={(e) => { return; }}>
        {props.formattedValue}
    </p>
}