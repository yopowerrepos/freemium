import * as React from "react";
import { Text } from "@fluentui/react-components";

/** Label beside its control on one line - for toolbar-style rows, where a stacked Field label wastes height. */
export const InlineField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Text size={200} weight="semibold">
            {label}
        </Text>
        {children}
    </div>
);
