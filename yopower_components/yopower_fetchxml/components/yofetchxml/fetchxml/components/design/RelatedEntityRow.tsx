import * as React from "react";
import { Combobox, Option, OptionGroup, Input, Dropdown, Button, Spinner, Text } from "@fluentui/react-components";
import { ILinkEntity, LinkType, isStructuralLinkType } from "../../models/fetchXmlModel";
import { RelationshipKind, IRelationshipOption } from "../../services/metadataService";
import { useEntityRelationships } from "../useEntityRelationships";
import { FilterGroupEditor } from "./FilterGroupEditor";
import { applyRelationship } from "../../services/relationshipService";
import { SCROLLABLE_LISTBOX, COMPACT_FIELD_PROPS, POPUP_FIELD_PROPS, COMPACT_HEIGHT_STYLE, LINK_ENTITY_BOX_STYLE } from "./treeStyles";
import { useComboboxFilter } from "./useComboboxFilter";

/** Cardinality labels as makers see them in Dataverse itself, in display order. */
const RELATIONSHIP_KIND_GROUPS: { kind: RelationshipKind; label: string }[] = [
    { kind: "ManyToOne", label: "N:1" },
    { kind: "OneToMany", label: "1:N" },
    { kind: "ManyToMany", label: "N:N" },
];

function groupRelationshipsByKind(options: IRelationshipOption[]): { kind: RelationshipKind; label: string; items: IRelationshipOption[] }[] {
    return RELATIONSHIP_KIND_GROUPS.map((group) => ({ ...group, items: options.filter((o) => o.kind === group.kind) })).filter((group) => group.items.length > 0);
}

export interface IRelatedEntityRowProps {
    link: ILinkEntity;
    parentEntityName: string;
    onChange: React.Dispatch<React.SetStateAction<ILinkEntity>>;
    onRemove: () => void;
}

const JOIN_TYPE_LABELS: { value: LinkType; label: string }[] = [
    { value: "inner", label: "Inner (must match)" },
    { value: "outer", label: "Outer (include unmatched)" },
    { value: "any", label: "Any (contains data)" },
    { value: "not-any", label: "Not Any (does not contain data)" },
    { value: "all", label: "All" },
    { value: "not-all", label: "Not All" },
];

export const RelatedEntityRow: React.FC<IRelatedEntityRowProps> = ({ link, parentEntityName, onChange, onRemove }) => {
    const [expanded, setExpanded] = React.useState(true);
    const { relationships, loading, error } = useEntityRelationships(parentEntityName);

    const selected = relationships.find((r) => r.schemaName === link.relationshipSchemaName);
    const displayValue = selected?.label ?? (link.name ? link.name : "");
    const relationshipFilter = useComboboxFilter(relationships, (r) => r.label, displayValue);
    const groupedRelationships = React.useMemo(() => groupRelationshipsByKind(relationshipFilter.filteredItems), [relationshipFilter.filteredItems]);
    const joinTypeLabel = JOIN_TYPE_LABELS.find((j) => j.value === link.linkType)?.label ?? "Inner (must match)";

    const linkLabel = link.alias || link.name || "related entity";

    return (
        <div
            style={{
                ...LINK_ENTITY_BOX_STYLE,
                display: "flex",
                flexDirection: "column",
                gap: "6px",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Button size="small" appearance="subtle" style={COMPACT_HEIGHT_STYLE} onClick={() => setExpanded((v) => !v)} aria-label={expanded ? "Collapse" : "Expand"}>
                        {expanded ? "▾" : "▸"}
                    </Button>
                    <Text weight="bold" size={300}>
                        {`Link Entity: ${linkLabel}`}
                    </Text>
                </div>
                <Button size="small" appearance="subtle" style={COMPACT_HEIGHT_STYLE} onClick={onRemove} aria-label="Remove related entity">
                    ✕
                </Button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <Combobox
                    {...POPUP_FIELD_PROPS}
                    placeholder={loading ? "Loading relationships..." : "Choose a related entity..."}
                    value={relationshipFilter.inputValue}
                    selectedOptions={link.relationshipSchemaName ? [link.relationshipSchemaName] : []}
                    onChange={(e) => relationshipFilter.onInputChange((e.target as HTMLInputElement).value)}
                    onOptionSelect={(_, data) => {
                        relationshipFilter.endSearch();
                        const option = relationships.find((r) => r.schemaName === data.optionValue);
                        if (option) onChange(applyRelationship(link, parentEntityName, option));
                    }}
                    onBlur={() => relationshipFilter.endSearch()}
                    listbox={SCROLLABLE_LISTBOX}
                    style={{ minWidth: "180px", ...COMPACT_HEIGHT_STYLE }}
                >
                    {groupedRelationships.map((group) => (
                        <OptionGroup key={group.kind} label={group.label}>
                            {group.items.map((r) => (
                                <Option key={r.schemaName} value={r.schemaName} text={r.label}>
                                    {r.label}
                                </Option>
                            ))}
                        </OptionGroup>
                    ))}
                </Combobox>
                <Input
                    {...COMPACT_FIELD_PROPS}
                    placeholder="alias"
                    value={link.alias}
                    onChange={(e) => onChange({ ...link, alias: e.target.value })}
                    style={{ maxWidth: "100px", ...COMPACT_HEIGHT_STYLE }}
                />
                <Dropdown
                    {...POPUP_FIELD_PROPS}
                    value={joinTypeLabel}
                    selectedOptions={[link.linkType]}
                    onOptionSelect={(_, data) => onChange({ ...link, linkType: (data.optionValue as LinkType) ?? "inner" })}
                    style={{ minWidth: "180px", ...COMPACT_HEIGHT_STYLE }}
                >
                    {JOIN_TYPE_LABELS.map((j) => (
                        <Option key={j.value} value={j.value}>
                            {j.label}
                        </Option>
                    ))}
                </Dropdown>
                {loading && <Spinner size="tiny" />}
            </div>

            {error && (
                <Text italic size={200}>
                    {`Could not load relationships for "${parentEntityName}": ${error}`}
                </Text>
            )}

            {!isStructuralLinkType(link.linkType) && (
                <Text italic size={200}>
                    This join type is existence-only - it does not return columns, so the Columns tab has nothing to configure for it.
                </Text>
            )}

            {expanded && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "24px" }}>
                    <FilterGroupEditor
                        filter={link.filter}
                        entityName={link.name}
                        onChange={(filter) => onChange((prev) => ({ ...prev, filter }))}
                        linkEntities={link.linkEntities}
                        onLinkEntitiesChange={(linkEntities) => onChange((prev) => ({ ...prev, linkEntities }))}
                    />
                </div>
            )}
        </div>
    );
};
