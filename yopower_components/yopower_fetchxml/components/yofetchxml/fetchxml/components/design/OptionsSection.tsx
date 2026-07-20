import * as React from "react";
import { Checkbox, Field, Dropdown, Option, SpinButton } from "@fluentui/react-components";
import { IFetchXmlQuery, PagingMode } from "../../models/fetchXmlModel";
import { COMPACT_FIELD_PROPS, POPUP_FIELD_PROPS, COMPACT_HEIGHT_STYLE } from "./treeStyles";

export interface IOptionsSectionProps {
    query: IFetchXmlQuery;
    onChange: (updated: IFetchXmlQuery) => void;
}

const PAGING_LABELS: Record<PagingMode, string> = {
    none: "None",
    top: "Limit (Top N)",
    page: "Page",
};

export const OptionsSection: React.FC<IOptionsSectionProps> = ({ query, onChange }) => {
    return (
        <>
            <Checkbox label="Distinct" checked={query.distinct} onChange={(_, data) => onChange({ ...query, distinct: !!data.checked })} />

            <Field label="Paging">
                <Dropdown
                    {...POPUP_FIELD_PROPS}
                    value={PAGING_LABELS[query.pagingMode]}
                    selectedOptions={[query.pagingMode]}
                    onOptionSelect={(_, data) => onChange({ ...query, pagingMode: (data.optionValue as PagingMode) ?? "none" })}
                    style={{ minWidth: "130px", ...COMPACT_HEIGHT_STYLE }}
                >
                    <Option value="none">None</Option>
                    <Option value="top">Limit (Top N)</Option>
                    <Option value="page">Page</Option>
                </Dropdown>
            </Field>

            {query.pagingMode === "top" && (
                <Field label="Top">
                    <SpinButton
                        {...COMPACT_FIELD_PROPS}
                        value={query.top ?? 0}
                        min={1}
                        onChange={(_, data) => onChange({ ...query, top: data.value ?? (data.displayValue ? parseInt(data.displayValue, 10) : query.top) })}
                        style={{ maxWidth: "90px", ...COMPACT_HEIGHT_STYLE }}
                    />
                </Field>
            )}

            {query.pagingMode === "page" && (
                <>
                    <Field label="Page">
                        <SpinButton
                            {...COMPACT_FIELD_PROPS}
                            value={query.page ?? 1}
                            min={1}
                            onChange={(_, data) => onChange({ ...query, page: data.value ?? query.page })}
                            style={{ maxWidth: "80px", ...COMPACT_HEIGHT_STYLE }}
                        />
                    </Field>
                    <Field label="Page Size">
                        <SpinButton
                            {...COMPACT_FIELD_PROPS}
                            value={query.count ?? 50}
                            min={1}
                            onChange={(_, data) => onChange({ ...query, count: data.value ?? query.count })}
                            style={{ maxWidth: "90px", ...COMPACT_HEIGHT_STYLE }}
                        />
                    </Field>
                </>
            )}
        </>
    );
};
