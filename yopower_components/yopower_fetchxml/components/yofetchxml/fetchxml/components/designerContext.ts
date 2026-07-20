import * as React from "react";
import { IAttributeMetadata, IEntityRelationshipsResult, IResolvedRecordLabel } from "../services/metadataService";
import { IPlaceholderDefinition } from "../models/placeholderModel";
import { IAliasedEntity } from "../models/fetchXmlModel";
import { IRequiredField } from "../models/requiredFieldModel";

export interface ILookupValue {
    id: string;
    name?: string;
    entityType: string;
}

export interface IDesignerContext {
    allowedEntities: string[];
    placeholders: IPlaceholderDefinition[];
    requiredFields: IRequiredField[];
    /** Every aliased link-entity in the current query, for cross-table `valueof` column comparisons. */
    aliasedEntities: IAliasedEntity[];
    /** Every table's logical name, for the entity picker when allowedEntities is empty (unrestricted). */
    getAllEntities: () => Promise<string[]>;
    getAttributes: (entityName: string) => Promise<IAttributeMetadata[]>;
    getRelationships: (entityName: string) => Promise<IEntityRelationshipsResult>;
    pickLookup: (entityTypes: string[]) => Promise<ILookupValue[]>;
    /** Resolves a systemuser record id to the caller id used to impersonate them on the Test tab (undefined if it can't be resolved). */
    resolveImpersonationUser: (systemUserId: string) => Promise<string | undefined>;
    /** Resolves a record id's display name (trying each candidate entity type in turn), to render a selected lookup/primary-key value as a name instead of a bare id. */
    resolveLookupLabel: (entityTypes: string[], id: string) => Promise<IResolvedRecordLabel | undefined>;
    /** Opens a record's form centered in a modal dialog. */
    openRecord: (entityName: string, id: string) => Promise<void>;
}

const defaultContext: IDesignerContext = {
    allowedEntities: [],
    placeholders: [],
    requiredFields: [],
    aliasedEntities: [],
    getAllEntities: () => Promise.resolve([]),
    getAttributes: () => Promise.resolve([]),
    getRelationships: () => Promise.resolve({ relationships: [] }),
    pickLookup: () => Promise.resolve([]),
    resolveImpersonationUser: () => Promise.resolve(undefined),
    resolveLookupLabel: () => Promise.resolve(undefined),
    openRecord: () => Promise.resolve(undefined),
};

export const DesignerContext = React.createContext<IDesignerContext>(defaultContext);

export function useDesignerContext(): IDesignerContext {
    return React.useContext(DesignerContext);
}
