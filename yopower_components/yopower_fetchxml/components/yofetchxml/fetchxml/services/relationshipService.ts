import { ILinkEntity, createEmptyLinkEntity, createEmptyFilter } from "../models/fetchXmlModel";
import { IRelationshipOption } from "./metadataService";

/**
 * Applies a picked relationship to a link-entity: sets the linked entity name and the
 * from/to join attributes automatically. Many-to-many relationships have no direct join
 * attributes on the parent, so they're represented as a link to the intersect entity with
 * a nested link-entity to the actual target (both hops are real, valid FetchXML).
 *
 * Picking a (different) relationship always resets this link's own columns, sort, filter and
 * nested related entities - they described the PREVIOUS target entity's schema and no longer
 * apply once the target changes.
 */
export function applyRelationship(link: ILinkEntity, parentEntityName: string, option: IRelationshipOption): ILinkEntity {
    const reset = {
        allAttributes: false,
        attributes: [] as string[],
        attributeAliases: {} as Record<string, string>,
        orders: [],
        filter: createEmptyFilter(),
    };

    if (option.kind !== "ManyToMany" || !option.intersect) {
        return {
            ...link,
            ...reset,
            name: option.targetEntity,
            from: option.from,
            to: option.to,
            relationshipSchemaName: option.schemaName,
            linkEntities: [],
        };
    }

    const nestedTarget: ILinkEntity = {
        ...createEmptyLinkEntity(),
        name: option.targetEntity,
        from: `${option.targetEntity}id`,
        to: option.intersect.targetAttribute,
        allAttributes: true,
    };

    return {
        ...link,
        ...reset,
        name: option.intersect.entityName,
        from: option.intersect.parentAttribute,
        to: `${parentEntityName}id`,
        relationshipSchemaName: option.schemaName,
        linkEntities: [nestedTarget],
    };
}
