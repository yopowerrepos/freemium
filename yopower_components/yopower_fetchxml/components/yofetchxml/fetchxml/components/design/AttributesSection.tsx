import * as React from "react";
import { Combobox, Option, Checkbox, Input, Button, Text, tokens } from "@fluentui/react-components";
import { useEntityAttributes, findAttribute } from "../useEntityAttributes";
import { SCROLLABLE_LISTBOX, COMPACT_FIELD_PROPS, POPUP_FIELD_PROPS, COMPACT_HEIGHT_STYLE } from "./treeStyles";
import { useComboboxFilter } from "./useComboboxFilter";

export interface IAttributesSectionProps {
    label: string;
    entityName: string;
    allAttributes: boolean;
    attributes: string[];
    attributeAliases: Record<string, string>;
    /** Attribute logical names that must stay selected (from the requiredFields manifest config); their remove control is hidden. */
    requiredAttributes?: string[];
    onChange: (allAttributes: boolean, attributes: string[]) => void;
    onAliasChange: (attributeName: string, alias: string) => void;
}

export const AttributesSection: React.FC<IAttributesSectionProps> = ({
    label,
    entityName,
    allAttributes,
    attributes,
    attributeAliases,
    requiredAttributes,
    onChange,
    onAliasChange,
}) => {
    const { attributes: meta, loading } = useEntityAttributes(entityName);
    const required = requiredAttributes ?? [];
    // The combobox is search-only: it never displays the current selection as text, and always
    // clears back to the placeholder once a pick is made, so it stays ready for the next search.
    const filter = useComboboxFilter(meta, (a) => `${a.displayName} ${a.logicalName}`, "");

    const withRequired = (selected: string[]): string[] => Array.from(new Set([...selected, ...required]));

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-start" }}>
            <Text weight="semibold" size={200}>
                {label}
            </Text>
            <Checkbox label="All attributes" checked={allAttributes} onChange={(_, data) => onChange(!!data.checked, attributes)} />
            {!allAttributes && (
                <>
                    <Combobox
                        {...POPUP_FIELD_PROPS}
                        multiselect
                        placeholder={loading ? "Loading attributes..." : "Columns"}
                        selectedOptions={attributes}
                        value={filter.inputValue}
                        onChange={(e) => filter.onInputChange((e.target as HTMLInputElement).value)}
                        onOptionSelect={(_, data) => {
                            filter.endSearch();
                            onChange(false, withRequired(data.selectedOptions));
                        }}
                        onBlur={() => filter.endSearch()}
                        listbox={SCROLLABLE_LISTBOX}
                        style={{ width: "auto", minWidth: "220px", ...COMPACT_HEIGHT_STYLE }}
                    >
                        {filter.filteredItems.map((a) => (
                            <Option key={a.logicalName} value={a.logicalName} text={a.logicalName}>
                                {`${a.displayName} (${a.logicalName})`}
                            </Option>
                        ))}
                    </Combobox>

                    {attributes.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {attributes.map((attrName) => {
                                const attrMeta = findAttribute(meta, attrName);
                                const isRequired = required.includes(attrName);
                                return (
                                    <div key={attrName} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                        <Text style={{ minWidth: "180px" }}>{attrMeta ? `${attrMeta.displayName} (${attrName})` : attrName}</Text>
                                        <Input
                                            {...COMPACT_FIELD_PROPS}
                                            placeholder="alias (optional)"
                                            value={attributeAliases[attrName] ?? ""}
                                            onChange={(e) => onAliasChange(attrName, e.target.value)}
                                            style={{ maxWidth: "140px", ...COMPACT_HEIGHT_STYLE }}
                                        />
                                        {isRequired ? (
                                            <Text weight="bold" style={{ color: tokens.colorPaletteRedForeground1 }} aria-label="Required">
                                                *
                                            </Text>
                                        ) : (
                                            <Button
                                                size="small"
                                                appearance="subtle"
                                                style={COMPACT_HEIGHT_STYLE}
                                                onClick={() => onChange(false, attributes.filter((a) => a !== attrName))}
                                                aria-label={`Remove ${attrName}`}
                                            >
                                                ✕
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
