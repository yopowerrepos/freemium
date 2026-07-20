import * as React from "react";
import { Input, Dropdown, Option, Button, Spinner } from "@fluentui/react-components";
import { AttributeCategory } from "../../models/operators";
import { IAttributeMetadata } from "../../services/metadataService";
import { useDesignerContext } from "../designerContext";
import { COMPACT_FIELD_PROPS, POPUP_FIELD_PROPS, COMPACT_HEIGHT_STYLE } from "./treeStyles";

export interface ILiteralValueInputProps {
    category: AttributeCategory;
    attributeMeta?: IAttributeMetadata;
    value: string;
    onChange: (value: string) => void;
}

/**
 * A selected record renders exactly like a native Dataverse lookup: a clickable chip showing its
 * display name (hover for entity/id), opening the record in a centered dialog on click - not the
 * bare guid. Picking (or clearing) is always available alongside it.
 */
const LookupValueInput: React.FC<{ value: string; targets: string[]; onChange: (value: string) => void }> = ({ value, targets, onChange }) => {
    const { pickLookup, resolveLookupLabel, openRecord } = useDesignerContext();
    const [resolved, setResolved] = React.useState<{ name?: string; entityType: string } | undefined>(undefined);
    const [loading, setLoading] = React.useState(false);
    const targetsKey = targets.join(",");

    React.useEffect(() => {
        let cancelled = false;
        if (!value || targets.length === 0) {
            setResolved(undefined);
            return undefined;
        }
        setLoading(true);
        resolveLookupLabel(targets, value)
            .then((r) => {
                if (!cancelled) {
                    setResolved(r);
                    setLoading(false);
                }
                return undefined;
            })
            .catch(() => {
                if (!cancelled) {
                    setResolved(undefined);
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [value, targetsKey, resolveLookupLabel]);

    const handlePick = (): void => {
        if (targets.length === 0) return;
        pickLookup(targets)
            .then((results) => {
                if (results[0]) onChange(results[0].id.replace(/[{}]/g, ""));
                return undefined;
            })
            .catch(() => undefined);
    };

    if (!value) {
        return (
            <div style={{ display: "flex", gap: "4px" }}>
                <Input {...COMPACT_FIELD_PROPS} value={value} onChange={(e) => onChange(e.target.value)} placeholder="record id (guid)" style={COMPACT_HEIGHT_STYLE} />
                <Button size="small" appearance="subtle" style={COMPACT_HEIGHT_STYLE} onClick={handlePick}>
                    Select...
                </Button>
            </div>
        );
    }

    const label = resolved?.name ?? value;
    const entityTypeForOpen = resolved?.entityType ?? targets[0];

    return (
        <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "nowrap" }}>
            <Button
                size="small"
                appearance="transparent"
                style={{ ...COMPACT_HEIGHT_STYLE, justifyContent: "flex-start", maxWidth: "150px" }}
                title={`${label} (${entityTypeForOpen}, ${value})`}
                onClick={() => {
                    if (entityTypeForOpen) openRecord(entityTypeForOpen, value).catch(() => undefined);
                }}
            >
                {label}
            </Button>
            {loading && <Spinner size="tiny" />}
            <Button size="small" appearance="subtle" style={COMPACT_HEIGHT_STYLE} onClick={handlePick}>
                Change...
            </Button>
            <Button size="small" appearance="subtle" style={COMPACT_HEIGHT_STYLE} onClick={() => onChange("")} aria-label="Clear selected record">
                ✕
            </Button>
        </div>
    );
};

export const LiteralValueInput: React.FC<ILiteralValueInputProps> = ({ category, attributeMeta, value, onChange }) => {
    if (category === "boolean") {
        return (
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
    }

    if (category === "optionset" && attributeMeta?.options?.length) {
        const selected = attributeMeta.options.find((o) => String(o.value) === value);
        return (
            <Dropdown
                {...POPUP_FIELD_PROPS}
                value={selected?.label ?? value}
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
        );
    }

    if (category === "datetime") {
        return <Input {...COMPACT_FIELD_PROPS} type="date" value={value} onChange={(e) => onChange(e.target.value)} style={COMPACT_HEIGHT_STYLE} />;
    }

    if (category === "lookup") {
        return <LookupValueInput value={value} targets={attributeMeta?.targets ?? []} onChange={onChange} />;
    }

    const inputType = category === "integer" || category === "decimal" ? "number" : "text";
    return <Input {...COMPACT_FIELD_PROPS} type={inputType} value={value} onChange={(e) => onChange(e.target.value)} style={COMPACT_HEIGHT_STYLE} />;
};
