import * as React from "react";
import { Button, Dropdown, Option, Text, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from "@fluentui/react-components";
import { IFilter, FilterType, ILinkEntity, createEmptyCondition, createEmptyFilter, createEmptyLinkEntity } from "../../models/fetchXmlModel";
import { ConditionRow } from "./ConditionRow";
import { RelatedEntityRow } from "./RelatedEntityRow";
import { COMPACT_FIELD_PROPS, COMPACT_HEIGHT_STYLE, FILTER_GROUP_BORDER_STYLE } from "./treeStyles";
import { resolveUpdate } from "../updater";

export interface IFilterGroupEditorProps {
    filter: IFilter;
    entityName: string;
    onChange: (updated: IFilter) => void;
    onRemove?: () => void;
    depth?: number;
    /**
     * Related entities (link-entity) owned by the entity/link-entity this filter tree belongs to.
     * FetchXML only allows one linkEntities list per entity level (not per AND/OR group), so this
     * same array + setter is threaded unchanged through every nested group - the "+Add > Related
     * entity" option is offered at any depth, but rows always render at the top of the tree (depth 0).
     */
    linkEntities?: ILinkEntity[];
    onLinkEntitiesChange?: (updated: ILinkEntity[]) => void;
}

export const FilterGroupEditor: React.FC<IFilterGroupEditorProps> = ({ filter, entityName, onChange, onRemove, depth = 0, linkEntities, onLinkEntitiesChange }) => {
    const links = linkEntities ?? [];
    const isEmpty = filter.conditions.length === 0 && filter.filters.length === 0 && (depth > 0 || links.length === 0);

    return (
        <div style={{ marginTop: depth > 0 ? "6px" : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <Dropdown
                    {...COMPACT_FIELD_PROPS}
                    value={filter.type === "and" ? "AND" : "OR"}
                    selectedOptions={[filter.type]}
                    onOptionSelect={(_, data) => onChange({ ...filter, type: (data.optionValue as FilterType) ?? "and" })}
                    style={{ minWidth: "70px", ...COMPACT_HEIGHT_STYLE }}
                >
                    <Option value="and">AND</Option>
                    <Option value="or">OR</Option>
                </Dropdown>
                {onRemove && (
                    <Button size="small" appearance="subtle" style={COMPACT_HEIGHT_STYLE} onClick={onRemove} aria-label="Remove group">
                        ✕
                    </Button>
                )}
            </div>

            <div
                style={{
                    ...FILTER_GROUP_BORDER_STYLE,
                    marginLeft: "10px",
                    paddingLeft: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                }}
            >
                {isEmpty && (
                    <Text italic size={200}>
                        No conditions yet. Use &quot;+ Add&quot; below.
                    </Text>
                )}

                {filter.conditions.map((condition, idx) => (
                    <ConditionRow
                        key={condition.id}
                        condition={condition}
                        entityName={entityName}
                        onChange={(updated) => {
                            const next = [...filter.conditions];
                            next[idx] = updated;
                            onChange({ ...filter, conditions: next });
                        }}
                        onRemove={() => onChange({ ...filter, conditions: filter.conditions.filter((_, i) => i !== idx) })}
                    />
                ))}

                {filter.filters.map((sub, idx) => (
                    <FilterGroupEditor
                        key={sub.id}
                        filter={sub}
                        entityName={entityName}
                        depth={depth + 1}
                        linkEntities={linkEntities}
                        onLinkEntitiesChange={onLinkEntitiesChange}
                        onChange={(updated) => {
                            const next = [...filter.filters];
                            next[idx] = updated;
                            onChange({ ...filter, filters: next });
                        }}
                        onRemove={() => onChange({ ...filter, filters: filter.filters.filter((_, i) => i !== idx) })}
                    />
                ))}

                {depth === 0 &&
                    links.map((link, idx) => (
                        <RelatedEntityRow
                            key={link.id}
                            link={link}
                            parentEntityName={entityName}
                            onChange={(updated) => {
                                const next = [...links];
                                next[idx] = resolveUpdate(updated, links[idx]);
                                onLinkEntitiesChange?.(next);
                            }}
                            onRemove={() => onLinkEntitiesChange?.(links.filter((_, i) => i !== idx))}
                        />
                    ))}

                <div style={{ alignSelf: "flex-start" }}>
                    <Menu>
                        <MenuTrigger disableButtonEnhancement>
                            <Button size="small" appearance="subtle" style={{ alignSelf: "flex-start", ...COMPACT_HEIGHT_STYLE }}>
                                + Add
                            </Button>
                        </MenuTrigger>
                        <MenuPopover>
                            <MenuList>
                                <MenuItem onClick={() => onChange({ ...filter, conditions: [...filter.conditions, createEmptyCondition()] })}>Condition</MenuItem>
                                <MenuItem onClick={() => onChange({ ...filter, filters: [...filter.filters, createEmptyFilter()] })}>Group</MenuItem>
                                {onLinkEntitiesChange && <MenuItem onClick={() => onLinkEntitiesChange([...links, createEmptyLinkEntity()])}>Related entity</MenuItem>}
                            </MenuList>
                        </MenuPopover>
                    </Menu>
                </div>
            </div>
        </div>
    );
};
