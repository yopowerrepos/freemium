import * as React from "react";
import {
    Button,
    DataGrid,
    DataGridHeader,
    DataGridRow,
    DataGridHeaderCell,
    DataGridBody,
    DataGridCell,
    Link,
    createTableColumn,
    TableColumnDefinition,
} from "@fluentui/react-components";
import { IAliasedEntity } from "../../models/fetchXmlModel";
import { useDesignerContext } from "../designerContext";
import { COMPACT_HEIGHT_STYLE } from "../design/treeStyles";

export interface IResultsGridProps {
    records: Record<string, unknown>[];
    /** When true, prefer each column's "@OData.Community.Display.V1.FormattedValue" annotation (display name, formatted number/date) over the raw value. */
    formatted: boolean;
    /** The query's root entity, whose primary key identifies each row's own record. */
    entityName: string;
}

interface IIndexedRecord {
    __rowId: number;
    [key: string]: unknown;
}

const FORMATTED_VALUE_SUFFIX = "@OData.Community.Display.V1.FormattedValue";
const LOOKUP_LOGICAL_NAME_SUFFIX = "@Microsoft.Dynamics.CRM.lookuplogicalname";
const OPEN_COLUMN_ID = "__open";
const GUID_PATTERN = /^\{?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}?$/i;

/** Real columns only - every OData/Dynamics annotation (formatted value, lookup entity type, etc.) rides alongside its own column and isn't one of its own. */
function isDisplayableKey(key: string): boolean {
    return !key.includes("@");
}

function formatCellValue(value: unknown): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value as string | number | boolean | bigint);
}

/**
 * Which entity a column's guid points at, if any: a lookup carries its target in the
 * lookuplogicalname annotation; a primary key column ("accountid", or "alias.accountid" from a
 * link-entity) doesn't, so it's recognised by name against the root entity and the query's aliases.
 */
function resolveRecordEntity(item: IIndexedRecord, key: string, rootEntityName: string, aliasedEntities: IAliasedEntity[]): string | undefined {
    const annotated = item[`${key}${LOOKUP_LOGICAL_NAME_SUFFIX}`];
    if (typeof annotated === "string" && annotated) return annotated;
    if (rootEntityName && key.toLowerCase() === `${rootEntityName.toLowerCase()}id`) return rootEntityName;
    const dot = key.indexOf(".");
    if (dot > 0) {
        const alias = key.substring(0, dot);
        const attribute = key.substring(dot + 1).toLowerCase();
        const target = aliasedEntities.find((a) => a.alias === alias);
        if (target && attribute === `${target.entityName.toLowerCase()}id`) return target.entityName;
    }
    return undefined;
}

export const ResultsGrid: React.FC<IResultsGridProps> = ({ records, formatted, entityName }) => {
    const { openRecord, aliasedEntities } = useDesignerContext();

    const keys = React.useMemo(() => {
        const set = new Set<string>();
        records.forEach((r) =>
            Object.keys(r)
                .filter(isDisplayableKey)
                .forEach((k) => set.add(k)),
        );
        return Array.from(set);
    }, [records]);

    const indexedRecords: IIndexedRecord[] = React.useMemo(() => records.map((r, i) => ({ ...r, __rowId: i })), [records]);

    const open = React.useCallback(
        (targetEntity: string, id: string) => {
            openRecord(targetEntity, id.replace(/[{}]/g, "")).catch(() => undefined);
        },
        [openRecord],
    );

    const columns: TableColumnDefinition<IIndexedRecord>[] = React.useMemo(() => {
        const rootIdKey = entityName ? `${entityName.toLowerCase()}id` : "";
        const openColumn = createTableColumn<IIndexedRecord>({
            columnId: OPEN_COLUMN_ID,
            renderHeaderCell: () => "",
            renderCell: (item) => {
                const id = rootIdKey ? item[rootIdKey] : undefined;
                const canOpen = typeof id === "string" && GUID_PATTERN.test(id);
                return (
                    <Button
                        size="small"
                        appearance="subtle"
                        style={COMPACT_HEIGHT_STYLE}
                        disabled={!canOpen}
                        title={canOpen ? `Open this ${entityName} record` : `The ${entityName} primary key isn't in the results`}
                        aria-label="Open record"
                        onClick={() => {
                            if (canOpen) open(entityName, id);
                        }}
                    >
                        ↗
                    </Button>
                );
            },
        });

        const dataColumns = keys.map((key) =>
            createTableColumn<IIndexedRecord>({
                columnId: key,
                renderHeaderCell: () => key,
                renderCell: (item) => {
                    const rawValue = item[key];
                    const raw = formatCellValue(rawValue);
                    const display = formatted && item[`${key}${FORMATTED_VALUE_SUFFIX}`] !== undefined ? formatCellValue(item[`${key}${FORMATTED_VALUE_SUFFIX}`]) : raw;
                    const ellipsis: React.CSSProperties = {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                        maxWidth: "100%",
                    };

                    const targetEntity = typeof rawValue === "string" && GUID_PATTERN.test(rawValue) ? resolveRecordEntity(item, key, entityName, aliasedEntities) : undefined;
                    if (targetEntity) {
                        return (
                            <Link title={`${display} (${targetEntity}, ${raw})`} style={ellipsis} onClick={() => open(targetEntity, raw)}>
                                {display}
                            </Link>
                        );
                    }
                    return (
                        <span title={display} style={ellipsis}>
                            {display}
                        </span>
                    );
                },
            }),
        );

        return [openColumn, ...dataColumns];
    }, [keys, formatted, entityName, aliasedEntities, open]);

    const columnSizingOptions = React.useMemo(() => {
        const options: Record<string, { minWidth: number; defaultWidth: number; idealWidth?: number }> = {
            [OPEN_COLUMN_ID]: { minWidth: 36, defaultWidth: 36, idealWidth: 36 },
        };
        for (const key of keys) {
            options[key] = { minWidth: 100, defaultWidth: 160 };
        }
        return options;
    }, [keys]);

    if (records.length === 0) {
        return <p>No records returned.</p>;
    }

    return (
        <div
            style={{
                overflow: "auto",
                flex: 1,
                minHeight: 0,
                border: "1px solid var(--colorNeutralStroke2, #d1d1d1)",
            }}
        >
            <DataGrid
                items={indexedRecords}
                columns={columns}
                getRowId={(item: IIndexedRecord) => item.__rowId}
                resizableColumns
                columnSizingOptions={columnSizingOptions}
                style={{ minWidth: `${keys.length * 160 + 36}px` }}
            >
                <DataGridHeader>
                    <DataGridRow>{({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}</DataGridRow>
                </DataGridHeader>
                <DataGridBody<IIndexedRecord>>
                    {({ item, rowId }) => (
                        <DataGridRow<IIndexedRecord>
                            key={rowId}
                            onDoubleClick={() => {
                                const id = entityName ? item[`${entityName.toLowerCase()}id`] : undefined;
                                if (typeof id === "string" && GUID_PATTERN.test(id)) open(entityName, id);
                            }}
                        >
                            {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
                        </DataGridRow>
                    )}
                </DataGridBody>
            </DataGrid>
        </div>
    );
};
