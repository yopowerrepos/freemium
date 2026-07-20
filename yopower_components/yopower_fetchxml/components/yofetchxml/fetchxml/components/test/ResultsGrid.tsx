import * as React from "react";
import { DataGrid, DataGridHeader, DataGridRow, DataGridHeaderCell, DataGridBody, DataGridCell, createTableColumn, TableColumnDefinition } from "@fluentui/react-components";

export interface IResultsGridProps {
    records: Record<string, unknown>[];
    /** When true, prefer each column's "@OData.Community.Display.V1.FormattedValue" annotation (display name, formatted number/date) over the raw value. */
    formatted: boolean;
}

interface IIndexedRecord {
    __rowId: number;
    [key: string]: unknown;
}

const FORMATTED_VALUE_SUFFIX = "@OData.Community.Display.V1.FormattedValue";

/** Real columns only - every OData/Dynamics annotation (formatted value, lookup entity type, etc.) rides alongside its own column and isn't one of its own. */
function isDisplayableKey(key: string): boolean {
    return !key.includes("@");
}

function formatCellValue(value: unknown): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value as string | number | boolean | bigint);
}

export const ResultsGrid: React.FC<IResultsGridProps> = ({ records, formatted }) => {
    const keys = React.useMemo(() => {
        const set = new Set<string>();
        records.forEach((r) => Object.keys(r).filter(isDisplayableKey).forEach((k) => set.add(k)));
        return Array.from(set);
    }, [records]);

    const indexedRecords: IIndexedRecord[] = React.useMemo(() => records.map((r, i) => ({ ...r, __rowId: i })), [records]);

    const columns: TableColumnDefinition<IIndexedRecord>[] = React.useMemo(
        () =>
            keys.map((key) =>
                createTableColumn<IIndexedRecord>({
                    columnId: key,
                    renderHeaderCell: () => key,
                    renderCell: (item) => {
                        const raw = formatCellValue(item[key]);
                        const display = formatted && item[`${key}${FORMATTED_VALUE_SUFFIX}`] !== undefined ? formatCellValue(item[`${key}${FORMATTED_VALUE_SUFFIX}`]) : raw;
                        return (
                            <span title={display} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", maxWidth: "100%" }}>
                                {display}
                            </span>
                        );
                    },
                })
            ),
        [keys, formatted]
    );

    const columnSizingOptions = React.useMemo(() => {
        const options: Record<string, { minWidth: number; defaultWidth: number }> = {};
        for (const key of keys) {
            options[key] = { minWidth: 100, defaultWidth: 160 };
        }
        return options;
    }, [keys]);

    if (records.length === 0) {
        return <p>No records returned.</p>;
    }

    return (
        <div style={{ overflow: "auto", maxHeight: "420px", border: "1px solid var(--colorNeutralStroke2, #d1d1d1)" }}>
            <DataGrid
                items={indexedRecords}
                columns={columns}
                getRowId={(item: IIndexedRecord) => item.__rowId}
                resizableColumns
                columnSizingOptions={columnSizingOptions}
                style={{ minWidth: `${keys.length * 160}px` }}
            >
                <DataGridHeader>
                    <DataGridRow>{({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}</DataGridRow>
                </DataGridHeader>
                <DataGridBody<IIndexedRecord>>
                    {({ item, rowId }) => (
                        <DataGridRow<IIndexedRecord> key={rowId}>
                            {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
                        </DataGridRow>
                    )}
                </DataGridBody>
            </DataGrid>
        </div>
    );
};
