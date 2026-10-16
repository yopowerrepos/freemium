import * as React from "react";
import { Combobox, Dropdown, Option, Button, Spinner } from "@fluentui/react-components";
import { ICondition } from "../../models/fetchXmlModel";
import { OPERATORS, getOperatorsForType, mapAttributeTypeToCategory } from "../../models/operators";
import { useEntityAttributes, findAttribute } from "../useEntityAttributes";
import { useDesignerContext } from "../designerContext";
import { ValueEditor } from "./ValueEditor";
import { SCROLLABLE_LISTBOX, POPUP_FIELD_PROPS, COMPACT_HEIGHT_STYLE } from "./treeStyles";
import { useComboboxFilter } from "./useComboboxFilter";

export interface IConditionRowProps {
    condition: ICondition;
    entityName: string;
    /**
     * Offer the entity picker, so the condition can target a link-entity's alias via `entityname`
     * instead of this filter's own entity. Only the root entity's filter supports that in FetchXML.
     */
    allowEntityAlias?: boolean;
    onChange: (updated: ICondition) => void;
    onRemove: () => void;
}

const OWN_ENTITY_KEY = "__own";

export const ConditionRow: React.FC<IConditionRowProps> = ({ condition, entityName, allowEntityAlias, onChange, onRemove }) => {
    const { aliasedEntities } = useDesignerContext();

    // A condition with entityname="alias" filters on that link-entity's columns, so its field list,
    // operators and value pickers all come from the aliased entity rather than the filter's own one.
    const aliasTarget = condition.entityAlias ? aliasedEntities.find((a) => a.alias === condition.entityAlias) : undefined;
    const effectiveEntityName = aliasTarget?.entityName ?? entityName;
    const showEntityPicker = !!condition.entityAlias || (!!allowEntityAlias && aliasedEntities.length > 0);

    const { attributes, loading } = useEntityAttributes(effectiveEntityName);
    const rawAttributeMeta = findAttribute(attributes, condition.attribute);

    // The entity's own primary key column (e.g. "accountid" on "account") isn't flagged as a
    // lookup by metadata, but picking a specific record for it behaves exactly like one - offer
    // the same record-picker experience, targeting this row's own entity.
    const isPrimaryKey = !!rawAttributeMeta && rawAttributeMeta.logicalName.toLowerCase() === `${effectiveEntityName.toLowerCase()}id`;
    const attributeMeta =
        isPrimaryKey && rawAttributeMeta ? { ...rawAttributeMeta, targets: rawAttributeMeta.targets?.length ? rawAttributeMeta.targets : [effectiveEntityName] } : rawAttributeMeta;
    const category = isPrimaryKey ? "lookup" : mapAttributeTypeToCategory(rawAttributeMeta?.attributeType);
    const operatorChoices = attributeMeta ? getOperatorsForType(category) : OPERATORS;
    const currentOperatorStillValid = operatorChoices.some((o) => o.id === condition.operator);

    const filteredAttributes = attributes.filter(
        (a) => !condition.attribute || a.displayName.toLowerCase().includes(condition.attribute.toLowerCase()) || a.logicalName.toLowerCase().includes(condition.attribute.toLowerCase())
    );

    const activeOperators = currentOperatorStillValid ? operatorChoices : OPERATORS;
    const selectedOperatorLabel = activeOperators.find((o) => o.id === condition.operator)?.label ?? condition.operator;
    const operatorFilter = useComboboxFilter(activeOperators, (op) => op.label, selectedOperatorLabel);

    const entityLabel = condition.entityAlias ? (aliasTarget ? `${aliasTarget.alias} (${aliasTarget.entityName})` : `${condition.entityAlias} (unknown alias)`) : entityName || "(entity)";

    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "4px 0" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", flexWrap: "wrap", flex: "1 1 auto", minWidth: 0 }}>
                {showEntityPicker && (
                    <Dropdown
                        {...POPUP_FIELD_PROPS}
                        value={entityLabel}
                        selectedOptions={[condition.entityAlias ?? OWN_ENTITY_KEY]}
                        onOptionSelect={(_, data) => {
                            const alias = data.optionValue === OWN_ENTITY_KEY ? undefined : data.optionValue;
                            if (alias === condition.entityAlias) return;
                            // Switching entity invalidates the field and its value - they belonged to the other table.
                            onChange({ ...condition, entityAlias: alias, attribute: "", operator: "eq", conditionValue: { mode: "literal", value: "" } });
                        }}
                        listbox={SCROLLABLE_LISTBOX}
                        title="Entity this condition filters on (entityname)"
                        style={{ flex: "0 0 160px", minWidth: "160px", ...COMPACT_HEIGHT_STYLE }}
                    >
                        <Option value={OWN_ENTITY_KEY} text={entityName || "(entity)"}>
                            {entityName || "(entity)"}
                        </Option>
                        {aliasedEntities.map((a) => (
                            <Option key={a.alias} value={a.alias} text={`${a.alias} (${a.entityName})`}>
                                {`${a.alias} (${a.entityName})`}
                            </Option>
                        ))}
                    </Dropdown>
                )}

                <Combobox
                    {...POPUP_FIELD_PROPS}
                    freeform
                    placeholder="Field"
                    value={condition.attribute}
                    selectedOptions={condition.attribute ? [condition.attribute] : []}
                    onOptionSelect={(_, data) => onChange({ ...condition, attribute: data.optionValue ?? "" })}
                    onChange={(e) => onChange({ ...condition, attribute: (e.target as HTMLInputElement).value })}
                    listbox={SCROLLABLE_LISTBOX}
                    style={{ flex: "0 0 220px", minWidth: "220px", ...COMPACT_HEIGHT_STYLE }}
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
                    style={{ flex: "0 0 190px", minWidth: "190px", ...COMPACT_HEIGHT_STYLE }}
                >
                    {operatorFilter.filteredItems.map((op) => (
                        <Option key={op.id} value={op.id} text={op.label}>
                            {op.label}
                        </Option>
                    ))}
                </Combobox>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "4px", flex: "0 1 auto", minWidth: 0 }}>
                    <ValueEditor
                        conditionValue={condition.conditionValue}
                        operator={condition.operator}
                        category={category}
                        attributeMeta={attributeMeta}
                        sameEntityAttributes={attributes}
                        entityName={effectiveEntityName}
                        attributeName={condition.attribute}
                        onChange={(conditionValue) => onChange({ ...condition, conditionValue })}
                    />
                    {loading && <Spinner size="tiny" />}
                </div>
            </div>

            <Button size="small" appearance="subtle" style={{ ...COMPACT_HEIGHT_STYLE, flex: "0 0 auto" }} onClick={onRemove} aria-label="Remove condition">
                ✕
            </Button>
        </div>
    );
};
