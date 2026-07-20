import * as React from "react";
import { Input, Combobox, Dropdown, Option, Button, Text } from "@fluentui/react-components";
import { IConditionValue, ValueMode } from "../../models/fetchXmlModel";
import { AttributeCategory, getOperator, supportsPlaceholder, supportsColumnComparison, mapAttributeTypeToCategory } from "../../models/operators";
import { IAttributeMetadata } from "../../services/metadataService";
import { useDesignerContext } from "../designerContext";
import { LiteralValueInput } from "./LiteralValueInput";
import { SCROLLABLE_LISTBOX, COMPACT_FIELD_PROPS, POPUP_FIELD_PROPS, COMPACT_HEIGHT_STYLE } from "./treeStyles";
import { useComboboxFilter } from "./useComboboxFilter";

export interface IValueEditorProps {
    conditionValue: IConditionValue;
    operator: string;
    category: AttributeCategory;
    attributeMeta?: IAttributeMetadata;
    /** The condition's own entity's attributes, used to offer same-row column comparison targets. */
    sameEntityAttributes: IAttributeMetadata[];
    /** The condition's own entity, used to restrict which placeholders are offered (see IPlaceholderDefinition.entityName). */
    entityName: string;
    /** The condition's attribute, used to restrict which placeholders are offered (see IPlaceholderDefinition.attributeName). */
    attributeName: string;
    onChange: (value: IConditionValue) => void;
}

const MODE_LABELS: { key: ValueMode; label: string }[] = [
    { key: "literal", label: "Value" },
    { key: "compareColumn", label: "Value Of" },
    { key: "placeholder", label: "Placeholder" },
];

const ManyValueEditor: React.FC<{
    category: AttributeCategory;
    attributeMeta?: IAttributeMetadata;
    values: string[];
    onChange: (values: string[]) => void;
}> = ({ category, attributeMeta, values, onChange }) => {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
            {values.map((v, idx) => (
                <div key={idx} style={{ display: "flex", gap: "2px", alignItems: "center" }}>
                    <LiteralValueInput
                        category={category}
                        attributeMeta={attributeMeta}
                        value={v}
                        onChange={(nv) => {
                            const next = [...values];
                            next[idx] = nv;
                            onChange(next);
                        }}
                    />
                    <Button size="small" appearance="subtle" style={COMPACT_HEIGHT_STYLE} onClick={() => onChange(values.filter((_, i) => i !== idx))} aria-label="Remove value">
                        ✕
                    </Button>
                </div>
            ))}
            <Button size="small" appearance="subtle" style={COMPACT_HEIGHT_STYLE} onClick={() => onChange([...values, ""])}>
                + value
            </Button>
        </div>
    );
};

export const ValueEditor: React.FC<IValueEditorProps> = ({ conditionValue, operator, category, attributeMeta, sameEntityAttributes, entityName, attributeName, onChange }) => {
    const { placeholders, aliasedEntities } = useDesignerContext();
    const op = getOperator(operator);
    const arity = op?.valueArity ?? "one";
    const canUsePlaceholder = supportsPlaceholder(operator);
    const canCompareColumn = supportsColumnComparison(operator);

    // Per Dataverse rules, column comparisons must be the same data type - only offer same-category columns.
    const comparableAttributes = sameEntityAttributes.filter((a) => a.logicalName !== attributeMeta?.logicalName && mapAttributeTypeToCategory(a.attributeType) === category);
    const compareLabel = conditionValue.compareTarget ?? "";
    const compareFilter = useComboboxFilter(comparableAttributes, (a) => `${a.displayName} ${a.logicalName}`, compareLabel);

    // A placeholder's entityName/attributeName are optional filters, not requirements: when set,
    // the placeholder can only be picked for a condition on that exact entity/attribute; when
    // omitted, it's offered everywhere.
    const eligiblePlaceholders = placeholders.filter(
        (p) => (!p.entityName || p.entityName.toLowerCase() === entityName.toLowerCase()) && (!p.attributeName || p.attributeName.toLowerCase() === attributeName.toLowerCase())
    );
    const placeholderLabel = conditionValue.placeholderName ?? "";
    const placeholderFilter = useComboboxFilter(eligiblePlaceholders, (p) => `${p.name} ${p.type}`, placeholderLabel);

    if (arity === "none") {
        return <Text italic>No value required</Text>;
    }

    const modeOptions = MODE_LABELS.filter((m) => m.key === "literal" || (m.key === "compareColumn" && canCompareColumn) || (m.key === "placeholder" && canUsePlaceholder));

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "nowrap" }}>
            {modeOptions.length > 1 && (
                <Dropdown
                    {...POPUP_FIELD_PROPS}
                    value={modeOptions.find((m) => m.key === conditionValue.mode)?.label ?? "Value"}
                    selectedOptions={[conditionValue.mode]}
                    onOptionSelect={(_, data) => onChange({ mode: (data.optionValue as ValueMode) ?? "literal" })}
                    style={{ minWidth: "110px", ...COMPACT_HEIGHT_STYLE }}
                >
                    {modeOptions.map((m) => (
                        <Option key={m.key} value={m.key}>
                            {m.label}
                        </Option>
                    ))}
                </Dropdown>
            )}

            {conditionValue.mode === "compareColumn" && canCompareColumn && (
                <>
                    <Combobox
                        {...POPUP_FIELD_PROPS}
                        placeholder="attribute or alias.attribute"
                        freeform
                        value={compareFilter.inputValue}
                        onChange={(e) => {
                            const value = (e.target as HTMLInputElement).value;
                            compareFilter.onInputChange(value);
                            onChange({ ...conditionValue, mode: "compareColumn", compareTarget: value });
                        }}
                        onOptionSelect={(_, data) => {
                            compareFilter.endSearch();
                            onChange({ ...conditionValue, mode: "compareColumn", compareTarget: data.optionValue });
                        }}
                        listbox={SCROLLABLE_LISTBOX}
                        style={COMPACT_HEIGHT_STYLE}
                    >
                        {compareFilter.filteredItems.map((a) => (
                            <Option key={a.logicalName} value={a.logicalName} text={a.logicalName}>
                                {`${a.displayName} (${a.logicalName})`}
                            </Option>
                        ))}
                    </Combobox>
                    {aliasedEntities.length > 0 && (
                        <Text italic size={200}>
                            {`aliases: ${aliasedEntities.map((a) => a.alias).join(", ")}`}
                        </Text>
                    )}
                </>
            )}

            {conditionValue.mode === "placeholder" && canUsePlaceholder && (
                <Combobox
                    {...POPUP_FIELD_PROPS}
                    placeholder="Select placeholder"
                    value={placeholderFilter.inputValue}
                    selectedOptions={conditionValue.placeholderName ? [conditionValue.placeholderName] : []}
                    onChange={(e) => placeholderFilter.onInputChange((e.target as HTMLInputElement).value)}
                    onOptionSelect={(_, data) => {
                        placeholderFilter.endSearch();
                        onChange({ ...conditionValue, mode: "placeholder", placeholderName: data.optionValue });
                    }}
                    onBlur={() => placeholderFilter.endSearch()}
                    listbox={SCROLLABLE_LISTBOX}
                    style={COMPACT_HEIGHT_STYLE}
                >
                    {eligiblePlaceholders.length === 0 && (
                        <Option key="__none" value="" disabled>
                            No placeholders configured
                        </Option>
                    )}
                    {placeholderFilter.filteredItems.map((p) => (
                        <Option key={p.name} value={p.name} text={`${p.name} (${p.type})`}>
                            {`${p.name} (${p.type})`}
                        </Option>
                    ))}
                </Combobox>
            )}

            {conditionValue.mode === "literal" && arity === "one" && (
                <LiteralValueInput
                    category={category}
                    attributeMeta={attributeMeta}
                    value={conditionValue.value ?? ""}
                    onChange={(v) => onChange({ ...conditionValue, mode: "literal", value: v })}
                />
            )}

            {conditionValue.mode === "literal" && arity === "xvalue" && (
                <Input
                    {...COMPACT_FIELD_PROPS}
                    type="number"
                    value={conditionValue.value ?? ""}
                    onChange={(e) => onChange({ ...conditionValue, mode: "literal", value: e.target.value })}
                    placeholder="X"
                    style={COMPACT_HEIGHT_STYLE}
                />
            )}

            {conditionValue.mode === "literal" && arity === "two" && (
                <>
                    <LiteralValueInput
                        category={category}
                        attributeMeta={attributeMeta}
                        value={conditionValue.value ?? ""}
                        onChange={(v) => onChange({ ...conditionValue, mode: "literal", value: v })}
                    />
                    <Text size={200}>and</Text>
                    <LiteralValueInput
                        category={category}
                        attributeMeta={attributeMeta}
                        value={conditionValue.value2 ?? ""}
                        onChange={(v) => onChange({ ...conditionValue, mode: "literal", value2: v })}
                    />
                </>
            )}

            {conditionValue.mode === "literal" && arity === "many" && (
                <ManyValueEditor
                    category={category}
                    attributeMeta={attributeMeta}
                    values={conditionValue.values ?? []}
                    onChange={(values) => onChange({ ...conditionValue, mode: "literal", values })}
                />
            )}
        </div>
    );
};
