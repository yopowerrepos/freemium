import * as React from "react";
import { Combobox, Option, Button, Spinner } from "@fluentui/react-components";
import { ICondition } from "../../models/fetchXmlModel";
import { OPERATORS, getOperatorsForType, mapAttributeTypeToCategory } from "../../models/operators";
import { useEntityAttributes, findAttribute } from "../useEntityAttributes";
import { ValueEditor } from "./ValueEditor";
import { SCROLLABLE_LISTBOX, POPUP_FIELD_PROPS, COMPACT_HEIGHT_STYLE } from "./treeStyles";
import { useComboboxFilter } from "./useComboboxFilter";

export interface IConditionRowProps {
    condition: ICondition;
    entityName: string;
    onChange: (updated: ICondition) => void;
    onRemove: () => void;
}

export const ConditionRow: React.FC<IConditionRowProps> = ({ condition, entityName, onChange, onRemove }) => {
    const { attributes, loading } = useEntityAttributes(entityName);
    const rawAttributeMeta = findAttribute(attributes, condition.attribute);

    // The entity's own primary key column (e.g. "accountid" on "account") isn't flagged as a
    // lookup by metadata, but picking a specific record for it behaves exactly like one - offer
    // the same record-picker experience, targeting this row's own entity.
    const isPrimaryKey = !!rawAttributeMeta && rawAttributeMeta.logicalName.toLowerCase() === `${entityName.toLowerCase()}id`;
    const attributeMeta = isPrimaryKey && rawAttributeMeta ? { ...rawAttributeMeta, targets: rawAttributeMeta.targets?.length ? rawAttributeMeta.targets : [entityName] } : rawAttributeMeta;
    const category = isPrimaryKey ? "lookup" : mapAttributeTypeToCategory(rawAttributeMeta?.attributeType);
    const operatorChoices = attributeMeta ? getOperatorsForType(category) : OPERATORS;
    const currentOperatorStillValid = operatorChoices.some((o) => o.id === condition.operator);

    const filteredAttributes = attributes.filter(
        (a) => !condition.attribute || a.displayName.toLowerCase().includes(condition.attribute.toLowerCase()) || a.logicalName.toLowerCase().includes(condition.attribute.toLowerCase())
    );

    const activeOperators = currentOperatorStillValid ? operatorChoices : OPERATORS;
    const selectedOperatorLabel = activeOperators.find((o) => o.id === condition.operator)?.label ?? condition.operator;
    const operatorFilter = useComboboxFilter(activeOperators, (op) => op.label, selectedOperatorLabel);

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0", overflowX: "auto" }}>
            <Button size="small" appearance="subtle" style={{ ...COMPACT_HEIGHT_STYLE, flex: "0 0 auto" }} onClick={onRemove} aria-label="Remove condition">
                ✕
            </Button>

            <Combobox
                {...POPUP_FIELD_PROPS}
                freeform
                placeholder="Field"
                value={condition.attribute}
                selectedOptions={condition.attribute ? [condition.attribute] : []}
                onOptionSelect={(_, data) => onChange({ ...condition, attribute: data.optionValue ?? "" })}
                onChange={(e) => onChange({ ...condition, attribute: (e.target as HTMLInputElement).value })}
                listbox={SCROLLABLE_LISTBOX}
                style={{ flex: "0 0 250px", ...COMPACT_HEIGHT_STYLE }}
            >
                {loading && (
                    <Option key="__loading" value={condition.attribute} disabled>
                        Loading...
                    </Option>
                )}
                {filteredAttributes.map((a) => (
                    <Option key={a.logicalName} value={a.logicalName} text={a.logicalName}>
                        {`${a.displayName} (${a.logicalName})`}
                    </Option>
                ))}
            </Combobox>

            <Combobox
                {...POPUP_FIELD_PROPS}
                placeholder="Operator"
                value={operatorFilter.inputValue}
                selectedOptions={[condition.operator]}
                onChange={(e) => operatorFilter.onInputChange((e.target as HTMLInputElement).value)}
                onOptionSelect={(_, data) => {
                    operatorFilter.endSearch();
                    onChange({ ...condition, operator: data.optionValue ?? "eq", conditionValue: { mode: "literal", value: "" } });
                }}
                onBlur={() => operatorFilter.endSearch()}
                listbox={SCROLLABLE_LISTBOX}
                style={{ flex: "0 0 200px", ...COMPACT_HEIGHT_STYLE }}
            >
                {operatorFilter.filteredItems.map((op) => (
                    <Option key={op.id} value={op.id} text={op.label}>
                        {op.label}
                    </Option>
                ))}
            </Combobox>

            <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "nowrap", flex: "0 0 auto", minWidth: "150px" }}>
                <ValueEditor
                    conditionValue={condition.conditionValue}
                    operator={condition.operator}
                    category={category}
                    attributeMeta={attributeMeta}
                    sameEntityAttributes={attributes}
                    entityName={entityName}
                    attributeName={condition.attribute}
                    onChange={(conditionValue) => onChange({ ...condition, conditionValue })}
                />
                {loading && <Spinner size="tiny" />}
            </div>
        </div>
    );
};
