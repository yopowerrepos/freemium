import * as React from "react";
import { IFetchXmlQuery, ILinkEntity, findRequiredAliasIssues, IRequiredAliasIssue } from "../models/fetchXmlModel";
import { IRequiredAlias, mapAttributeTypeToBinding } from "../models/requiredAliasModel";
import { IAttributeMetadata } from "../services/metadataService";

function collectEntityNames(query: IFetchXmlQuery): string[] {
    const names = new Set<string>();
    if (query.entityName) names.add(query.entityName);
    const walk = (links: ILinkEntity[]): void => {
        for (const link of links) {
            if (link.name) names.add(link.name);
            walk(link.linkEntities);
        }
    };
    walk(query.linkEntities);
    return Array.from(names).sort();
}

/** Resolves the live attribute metadata needed to validate `requiredAliases`, then reports any missing/mismatched aliases. Alert-only. */
export function useRequiredAliasIssues(
    query: IFetchXmlQuery,
    requiredAliases: IRequiredAlias[],
    getAttributes: (entityName: string) => Promise<IAttributeMetadata[]>
): IRequiredAliasIssue[] {
    const entityNamesKey = collectEntityNames(query).join("|");
    const [metaByEntity, setMetaByEntity] = React.useState<Record<string, IAttributeMetadata[]>>({});

    React.useEffect(() => {
        if (requiredAliases.length === 0 || entityNamesKey === "") return undefined;
        let cancelled = false;
        const names = entityNamesKey.split("|");
        Promise.all(
            names.map(
                (name): Promise<[string, IAttributeMetadata[]]> =>
                    getAttributes(name)
                        .then((attrs): [string, IAttributeMetadata[]] => [name, attrs])
                        .catch((): [string, IAttributeMetadata[]] => [name, []])
            )
        )
            .then((pairs) => {
                if (cancelled) return undefined;
                const next: Record<string, IAttributeMetadata[]> = {};
                for (const [name, attrs] of pairs) {
                    next[name] = attrs;
                }
                setMetaByEntity(next);
                return undefined;
            })
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, [entityNamesKey, requiredAliases.length, getAttributes]);

    return React.useMemo(() => {
        if (requiredAliases.length === 0) return [];
        return findRequiredAliasIssues(query, requiredAliases, (entityName, attributeLogicalName) => {
            const attr = metaByEntity[entityName]?.find((a) => a.logicalName.toLowerCase() === attributeLogicalName.toLowerCase());
            return mapAttributeTypeToBinding(attr?.attributeType);
        });
    }, [query, requiredAliases, metaByEntity]);
}
