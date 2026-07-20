import * as React from "react";
import { Text } from "@fluentui/react-components";
import { IFetchXmlQuery, ILinkEntity, isStructuralLinkType, createEmptyFilter, getRequiredAttributeNames } from "../../models/fetchXmlModel";
import { useDesignerContext } from "../designerContext";
import { EntitySection } from "./EntitySection";
import { AttributesSection } from "./AttributesSection";
import { OptionsSection } from "./OptionsSection";
import { OrderSection } from "./OrderSection";
import { LINK_ENTITY_BOX_STYLE } from "./treeStyles";

export interface IColumnsTabProps {
    query: IFetchXmlQuery;
    onChange: React.Dispatch<React.SetStateAction<IFetchXmlQuery>>;
}

const LinkEntityColumns: React.FC<{
    linkEntities: ILinkEntity[];
    onChange: (updated: ILinkEntity[]) => void;
}> = ({ linkEntities, onChange }) => {
    const { requiredFields } = useDesignerContext();
    if (linkEntities.length === 0) return null;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {linkEntities.map((link) => (
                <div key={link.id} style={{ ...LINK_ENTITY_BOX_STYLE, display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Text weight="bold" size={300}>
                        {`Link Entity: ${link.alias || link.name || "related entity"}`}
                    </Text>
                    {isStructuralLinkType(link.linkType) ? (
                        <>
                            <AttributesSection
                                label="Columns"
                                entityName={link.name}
                                allAttributes={link.allAttributes}
                                attributes={link.attributes}
                                attributeAliases={link.attributeAliases}
                                requiredAttributes={getRequiredAttributeNames(requiredFields, link.name, false)}
                                onChange={(allAttributes, attributes) => onChange(linkEntities.map((l) => (l.id === link.id ? { ...l, allAttributes, attributes } : l)))}
                                onAliasChange={(attr, alias) =>
                                    onChange(linkEntities.map((l) => (l.id === link.id ? { ...l, attributeAliases: { ...l.attributeAliases, [attr]: alias } } : l)))
                                }
                            />
                            <OrderSection
                                label="Sort"
                                entityName={link.name}
                                orders={link.orders}
                                onChange={(orders) => onChange(linkEntities.map((l) => (l.id === link.id ? { ...l, orders } : l)))}
                            />
                        </>
                    ) : (
                        <Text italic size={200}>
                            {`${link.alias || link.name || "related entity"}: existence-only join type - no columns to configure.`}
                        </Text>
                    )}
                    <LinkEntityColumns
                        linkEntities={link.linkEntities}
                        onChange={(nested) => onChange(linkEntities.map((l) => (l.id === link.id ? { ...l, linkEntities: nested } : l)))}
                    />
                </div>
            ))}
        </div>
    );
};

export const ColumnsTab: React.FC<IColumnsTabProps> = ({ query, onChange }) => {
    const { requiredFields } = useDesignerContext();

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "8px 0" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
                <EntitySection
                    label="Entity"
                    value={query.entityName}
                    onChange={(entityName) =>
                        onChange((prev) =>
                            entityName === prev.entityName
                                ? prev
                                : {
                                      ...prev,
                                      entityName,
                                      allAttributes: false,
                                      attributes: [],
                                      attributeAliases: {},
                                      orders: [],
                                      filter: createEmptyFilter(),
                                      linkEntities: [],
                                  }
                        )
                    }
                />
                <OptionsSection query={query} onChange={onChange} />
            </div>

            <AttributesSection
                label="Columns"
                entityName={query.entityName}
                allAttributes={query.allAttributes}
                attributes={query.attributes}
                attributeAliases={query.attributeAliases}
                requiredAttributes={getRequiredAttributeNames(requiredFields, query.entityName, true)}
                onChange={(allAttributes, attributes) => onChange((prev) => ({ ...prev, allAttributes, attributes }))}
                onAliasChange={(attr, alias) => onChange((prev) => ({ ...prev, attributeAliases: { ...prev.attributeAliases, [attr]: alias } }))}
            />

            <OrderSection label="Sort" entityName={query.entityName} orders={query.orders} onChange={(orders) => onChange((prev) => ({ ...prev, orders }))} />

            <LinkEntityColumns linkEntities={query.linkEntities} onChange={(linkEntities) => onChange((prev) => ({ ...prev, linkEntities }))} />
        </div>
    );
};
