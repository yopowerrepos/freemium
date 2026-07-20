import * as React from "react";
import { Combobox, Option, Text, Checkbox, Button } from "@fluentui/react-components";
import { IOrder, createEmptyOrder } from "../../models/fetchXmlModel";
import { useEntityAttributes } from "../useEntityAttributes";
import { SCROLLABLE_LISTBOX, POPUP_FIELD_PROPS, COMPACT_HEIGHT_STYLE } from "./treeStyles";

export interface IOrderSectionProps {
    label: string;
    entityName: string;
    orders: IOrder[];
    onChange: (orders: IOrder[]) => void;
}

export const OrderSection: React.FC<IOrderSectionProps> = ({ label, entityName, orders, onChange }) => {
    const { attributes } = useEntityAttributes(entityName);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Text weight="semibold" size={200}>
                {label}
            </Text>
            {orders.map((order, idx) => (
                <div key={order.id} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <Combobox
                        {...POPUP_FIELD_PROPS}
                        freeform
                        placeholder="Attribute"
                        value={order.attribute}
                        selectedOptions={order.attribute ? [order.attribute] : []}
                        onOptionSelect={(_, data) => {
                            const next = [...orders];
                            next[idx] = { ...order, attribute: data.optionValue ?? "" };
                            onChange(next);
                        }}
                        onChange={(e) => {
                            const next = [...orders];
                            next[idx] = { ...order, attribute: (e.target as HTMLInputElement).value };
                            onChange(next);
                        }}
                        listbox={SCROLLABLE_LISTBOX}
                        style={COMPACT_HEIGHT_STYLE}
                    >
                        {attributes
                            .filter(
                                (a) => !order.attribute || a.displayName.toLowerCase().includes(order.attribute.toLowerCase()) || a.logicalName.toLowerCase().includes(order.attribute.toLowerCase())
                            )
                            .map((a) => (
                                <Option key={a.logicalName} value={a.logicalName}>
                                    {a.displayName}
                                </Option>
                            ))}
                    </Combobox>
                    <Checkbox
                        label="Descending"
                        checked={order.descending}
                        onChange={(_, data) => {
                            const next = [...orders];
                            next[idx] = { ...order, descending: !!data.checked };
                            onChange(next);
                        }}
                    />
                    <Button size="small" appearance="subtle" style={COMPACT_HEIGHT_STYLE} onClick={() => onChange(orders.filter((_, i) => i !== idx))} aria-label="Remove sort">
                        ✕
                    </Button>
                </div>
            ))}
            <Button size="small" appearance="subtle" style={{ alignSelf: "flex-start", ...COMPACT_HEIGHT_STYLE }} onClick={() => onChange([...orders, createEmptyOrder()])} aria-label="Add sort">
                + Add sort
            </Button>
        </div>
    );
};
