import * as React from "react";
import { Input, Dropdown, Option, Button, Field } from "@fluentui/react-components";
import { IPlaceholderDefinition } from "../../models/placeholderModel";
import { useDesignerContext } from "../designerContext";
import { useEntityAttributes, findAttribute } from "../useEntityAttributes";
import { COMPACT_FIELD_PROPS, POPUP_FIELD_PROPS, COMPACT_HEIGHT_STYLE } from "../design/treeStyles";

export interface IPlaceholderValueInputProps {
    placeholder: IPlaceholderDefinition;
    value: string;
    onChange: (value: string) => void;
}

export const PlaceholderValueInput: React.FC<IPlaceholderValueInputProps> = ({ placeholder, value, onChange }) => {
    const { pickLookup } = useDesignerContext();
    const { attributes } = useEntityAttributes(placeholder.type === "optionset" ? placeholder.entityName ?? "" : "");
    const attributeMeta = placeholder.attributeName ? findAttribute(attributes, placeholder.attributeName) : undefined;

    let control: React.ReactNode;
    switch (placeholder.type) {
        case "boolean":
            control = (
                <Dropdown
                    {...POPUP_FIELD_PROPS}
                    value={value === "1" ? "True" : value === "0" ? "False" : ""}
                    selectedOptions={value ? [value] : []}
                    onOptionSelect={(_, data) => onChange(data.optionValue ?? "")}
                    style={COMPACT_HEIGHT_STYLE}
                >
                    <Option value="1">True</Option>
                    <Option value="0">False</Option>
                </Dropdown>
            );
            break;
        case "optionset":
            control = attributeMeta?.options?.length ? (
                <Dropdown
                    {...POPUP_FIELD_PROPS}
                    value={attributeMeta.options.find((o) => String(o.value) === value)?.label ?? value}
                    selectedOptions={value ? [value] : []}
                    onOptionSelect={(_, data) => onChange(data.optionValue ?? "")}
                    style={COMPACT_HEIGHT_STYLE}
                >
                    {attributeMeta.options.map((o) => (
                        <Option key={o.value} value={String(o.value)}>
                            {o.label}
                        </Option>
                    ))}
                </Dropdown>
            ) : (
                <Input {...COMPACT_FIELD_PROPS} value={value} onChange={(e) => onChange(e.target.value)} placeholder="option value" style={COMPACT_HEIGHT_STYLE} />
            );
            break;
        case "datetime":
            control = <Input {...COMPACT_FIELD_PROPS} type="date" value={value} onChange={(e) => onChange(e.target.value)} style={COMPACT_HEIGHT_STYLE} />;
            break;
        case "guid":
        case "lookup":
            control = (
                <div style={{ display: "flex", gap: "4px" }}>
                    <Input {...COMPACT_FIELD_PROPS} value={value} onChange={(e) => onChange(e.target.value)} placeholder="record id (guid)" style={COMPACT_HEIGHT_STYLE} />
                    {placeholder.type === "lookup" && placeholder.entityName && (
                        <Button
                            size="small"
                            appearance="subtle"
                            style={COMPACT_HEIGHT_STYLE}
                            onClick={() => {
                                pickLookup([placeholder.entityName!])
                                    .then((results) => {
                                        if (results[0]) onChange(results[0].id.replace(/[{}]/g, ""));
                                        return undefined;
                                    })
                                    .catch(() => undefined);
                            }}
                        >
                            Select...
                        </Button>
                    )}
                </div>
            );
            break;
        case "decimal":
            control = <Input {...COMPACT_FIELD_PROPS} type="number" value={value} onChange={(e) => onChange(e.target.value)} style={COMPACT_HEIGHT_STYLE} />;
            break;
        default:
            control = <Input {...COMPACT_FIELD_PROPS} value={value} onChange={(e) => onChange(e.target.value)} style={COMPACT_HEIGHT_STYLE} />;
    }

    return (
        <Field label={`${placeholder.name} (${placeholder.type})`} required={placeholder.required}>
            {control}
        </Field>
    );
};
