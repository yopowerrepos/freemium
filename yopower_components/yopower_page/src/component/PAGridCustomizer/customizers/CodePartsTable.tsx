import * as React from "react";

export interface CodePart {
    part: string;
    value: string;
    meaning?: string;
}

const cellStyle: React.CSSProperties = { padding: "4px 8px", borderBottom: "1px solid #e0e0e0", textAlign: "left", verticalAlign: "top" };

// Breakdown of a standard layout (boleto, GS1, Pix...) shown below the code on popovers
export const CodePartsTable: React.FC<{ parts: CodePart[], valueHeader?: string }> = ({ parts, valueHeader }) => {
    const hasMeaning = parts.some(p => p.meaning);

    return (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px", fontSize: "13px" }}>
            <thead>
                <tr>
                    <th style={cellStyle}>Part</th>
                    <th style={cellStyle}>{valueHeader ?? "Value"}</th>
                    {hasMeaning && <th style={cellStyle}>Meaning</th>}
                </tr>
            </thead>
            <tbody>
                {parts.map((p, i) => (
                    <tr key={i}>
                        <td style={{ ...cellStyle, whiteSpace: "nowrap" }}>{p.part}</td>
                        <td style={{ ...cellStyle, fontFamily: "Consolas, monospace", wordBreak: "break-all" }}>{p.value}</td>
                        {hasMeaning && <td style={cellStyle}>{p.meaning}</td>}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
