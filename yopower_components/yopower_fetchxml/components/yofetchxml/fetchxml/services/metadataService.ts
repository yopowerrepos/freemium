/**
 * Live Dataverse metadata access. Every exported function fails soft (throws are
 * caught by callers) so the UI can fall back to free-text entry when metadata is
 * unavailable (local test harness, missing privileges, etc.).
 *
 * Attribute discovery goes through the Web API metadata endpoints directly (relative
 * URL, same-origin) rather than context.utils.getEntityMetadata, because that API only
 * returns metadata for attribute names you already know - it cannot enumerate the full
 * attribute list for an entity, which the attribute picker needs.
 */

export interface IOptionMetadata {
    label: string;
    value: number;
}

export interface IAttributeMetadata {
    logicalName: string;
    displayName: string;
    attributeType: string;
    options?: IOptionMetadata[];
    targets?: string[];
}

const WEB_API_VERSION_PATH = "/api/data/v9.2";

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
        },
        credentials: "same-origin",
    });
    if (!response.ok) {
        throw new Error(`Metadata request failed (${response.status}): ${url}`);
    }
    return response.json() as Promise<T>;
}

/** Follows @odata.nextLink so large metadata collections (e.g. an entity with 100+ relationships) are never silently truncated. */
async function fetchAllPages<T>(url: string): Promise<T[]> {
    const results: T[] = [];
    let nextUrl: string | undefined = url;
    while (nextUrl) {
        const data: { value: T[]; "@odata.nextLink"?: string } = await fetchJson(nextUrl);
        results.push(...(data.value ?? []));
        nextUrl = data["@odata.nextLink"];
    }
    return results;
}

function getLabel(labelObj: unknown): string | undefined {
    const localized = (labelObj as { UserLocalizedLabel?: { Label?: string } } | undefined)?.UserLocalizedLabel?.Label;
    return localized ?? undefined;
}

interface IRawAttribute {
    LogicalName: string;
    AttributeType: string;
    DisplayName?: unknown;
}

interface IRawOptionSetAttribute {
    LogicalName: string;
    OptionSet?: {
        Options?: { Value: number; Label?: unknown }[];
    };
}

interface IRawLookupAttribute {
    LogicalName: string;
    Targets?: string[];
}

const attributeCache = new Map<string, Promise<IAttributeMetadata[]>>();

async function fetchOptionSets(entityLogicalName: string): Promise<Map<string, IOptionMetadata[]>> {
    const url =
        `${WEB_API_VERSION_PATH}/EntityDefinitions(LogicalName='${encodeURIComponent(entityLogicalName)}')` +
        `/Attributes/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet($select=Options)`;
    const rows = await fetchAllPages<IRawOptionSetAttribute>(url);
    const map = new Map<string, IOptionMetadata[]>();
    for (const attr of rows) {
        const options = (attr.OptionSet?.Options ?? []).map((o) => ({
            value: o.Value,
            label: getLabel(o.Label) ?? String(o.Value),
        }));
        map.set(attr.LogicalName, options);
    }
    return map;
}

async function fetchLookupTargets(entityLogicalName: string): Promise<Map<string, string[]>> {
    const url =
        `${WEB_API_VERSION_PATH}/EntityDefinitions(LogicalName='${encodeURIComponent(entityLogicalName)}')` +
        `/Attributes/Microsoft.Dynamics.CRM.LookupAttributeMetadata?$select=LogicalName,Targets`;
    const rows = await fetchAllPages<IRawLookupAttribute>(url);
    const map = new Map<string, string[]>();
    for (const attr of rows) {
        map.set(attr.LogicalName, attr.Targets ?? []);
    }
    return map;
}

/** Fetches (and caches) the full attribute list for an entity, with optionset/lookup detail attached. */
export function getEntityAttributes(entityLogicalName: string): Promise<IAttributeMetadata[]> {
    const key = entityLogicalName.toLowerCase();
    if (!key) return Promise.resolve([]);
    const cached = attributeCache.get(key);
    if (cached) return cached;

    const promise = (async () => {
        const listUrl = `${WEB_API_VERSION_PATH}/EntityDefinitions(LogicalName='${encodeURIComponent(key)}')/Attributes?$select=LogicalName,DisplayName,AttributeType`;
        const rawAttributes = await fetchAllPages<IRawAttribute>(listUrl);
        const attributes: IAttributeMetadata[] = rawAttributes.map((raw) => ({
            logicalName: raw.LogicalName,
            displayName: getLabel(raw.DisplayName) ?? raw.LogicalName,
            attributeType: raw.AttributeType,
        }));

        const [optionSets, lookupTargets] = await Promise.all([
            fetchOptionSets(key).catch(() => new Map<string, IOptionMetadata[]>()),
            fetchLookupTargets(key).catch(() => new Map<string, string[]>()),
        ]);

        for (const attr of attributes) {
            if (optionSets.has(attr.logicalName)) {
                attr.options = optionSets.get(attr.logicalName);
            }
            if (lookupTargets.has(attr.logicalName)) {
                attr.targets = lookupTargets.get(attr.logicalName);
            }
        }
        attributes.sort((a, b) => a.displayName.localeCompare(b.displayName));
        return attributes;
    })();

    attributeCache.set(key, promise);
    // Don't cache a rejected lookup - let the next attempt retry.
    promise.catch(() => attributeCache.delete(key));
    return promise;
}

export type RelationshipKind = "OneToMany" | "ManyToOne" | "ManyToMany";

export interface IRelationshipOption {
    schemaName: string;
    label: string;
    kind: RelationshipKind;
    targetEntity: string;
    /** attribute on the target/linked entity, empty for ManyToMany (resolved via intersect) */
    from: string;
    /** attribute on the parent entity, empty for ManyToMany (resolved via intersect) */
    to: string;
    intersect?: {
        entityName: string;
        /** attribute on the intersect entity that matches the parent entity's primary key */
        parentAttribute: string;
        /** attribute on the intersect entity that matches the target entity's primary key */
        targetAttribute: string;
    };
}

interface IRawOneToMany {
    SchemaName: string;
    ReferencingEntity: string;
    ReferencingAttribute: string;
    ReferencedAttribute: string;
}

interface IRawManyToOne {
    SchemaName: string;
    ReferencedEntity: string;
    ReferencedAttribute: string;
    ReferencingAttribute: string;
}

interface IRawManyToMany {
    SchemaName: string;
    Entity1LogicalName: string;
    Entity2LogicalName: string;
    Entity1IntersectAttribute: string;
    Entity2IntersectAttribute: string;
    IntersectEntityName: string;
}

/**
 * Owner/Customer (and any other multi-target) lookup attributes are polymorphic - a single field
 * that can point at more than one entity type. Dataverse relationship metadata doesn't reliably
 * enumerate one ManyToOneRelationship per possible target for these, so they're synthesized
 * directly from attribute metadata (which already carries the full Targets list) instead.
 */
async function synthesizePolymorphicOptions(entityLogicalName: string): Promise<IRelationshipOption[]> {
    const attributes = await getEntityAttributes(entityLogicalName);
    const options: IRelationshipOption[] = [];
    for (const attr of attributes) {
        const targets = attr.targets ?? [];
        if (targets.length <= 1) continue;
        for (const target of targets) {
            options.push({
                schemaName: `${attr.logicalName}_${target}`,
                label: `${target} (${attr.displayName})`,
                kind: "ManyToOne",
                targetEntity: target,
                from: `${target}id`,
                to: attr.logicalName,
            });
        }
    }
    return options;
}

export interface IEntityRelationshipsResult {
    relationships: IRelationshipOption[];
    /** Set when one or more relationship kinds failed to load - the list may be incomplete. */
    error?: string;
}

const relationshipCache = new Map<string, Promise<IEntityRelationshipsResult>>();

/**
 * Fetches (and caches) every 1:N, N:1 and N:N relationship available from an entity, for the
 * related-entity picker. Each of the three relationship kinds is fetched independently and
 * fully paged (@odata.nextLink) so large entities don't get truncated; if any kind fails, the
 * others are still returned and `error` is set (never silently reported as "no relationships").
 */
export function getEntityRelationships(entityLogicalName: string): Promise<IEntityRelationshipsResult> {
    const key = entityLogicalName.toLowerCase();
    if (!key) return Promise.resolve({ relationships: [] });
    const cached = relationshipCache.get(key);
    if (cached) return cached;

    const promise = (async (): Promise<IEntityRelationshipsResult> => {
        const base = `${WEB_API_VERSION_PATH}/EntityDefinitions(LogicalName='${encodeURIComponent(key)}')`;
        const [oneToMany, manyToOne, manyToMany, polymorphic] = await Promise.allSettled([
            fetchAllPages<IRawOneToMany>(`${base}/OneToManyRelationships?$select=SchemaName,ReferencingEntity,ReferencingAttribute,ReferencedAttribute`),
            fetchAllPages<IRawManyToOne>(`${base}/ManyToOneRelationships?$select=SchemaName,ReferencedEntity,ReferencedAttribute,ReferencingAttribute`),
            fetchAllPages<IRawManyToMany>(
                `${base}/ManyToManyRelationships?$select=SchemaName,Entity1LogicalName,Entity2LogicalName,Entity1IntersectAttribute,Entity2IntersectAttribute,IntersectEntityName`
            ),
            synthesizePolymorphicOptions(key),
        ]);

        const options: IRelationshipOption[] = [];
        const failedKinds: string[] = [];

        if (oneToMany.status === "fulfilled") {
            for (const r of oneToMany.value) {
                options.push({
                    schemaName: r.SchemaName,
                    label: `${r.ReferencingEntity} (${r.SchemaName})`,
                    kind: "OneToMany",
                    targetEntity: r.ReferencingEntity,
                    from: r.ReferencingAttribute,
                    to: r.ReferencedAttribute,
                });
            }
        } else {
            failedKinds.push("one-to-many");
        }

        if (manyToOne.status === "fulfilled") {
            for (const r of manyToOne.value) {
                options.push({
                    schemaName: r.SchemaName,
                    label: `${r.ReferencedEntity} (${r.SchemaName})`,
                    kind: "ManyToOne",
                    targetEntity: r.ReferencedEntity,
                    from: r.ReferencedAttribute,
                    to: r.ReferencingAttribute,
                });
            }
        } else {
            failedKinds.push("many-to-one");
        }

        if (manyToMany.status === "fulfilled") {
            for (const r of manyToMany.value) {
                const isEntity1 = r.Entity1LogicalName.toLowerCase() === key;
                const targetEntity = isEntity1 ? r.Entity2LogicalName : r.Entity1LogicalName;
                const parentIntersectAttr = isEntity1 ? r.Entity1IntersectAttribute : r.Entity2IntersectAttribute;
                const targetIntersectAttr = isEntity1 ? r.Entity2IntersectAttribute : r.Entity1IntersectAttribute;
                options.push({
                    schemaName: r.SchemaName,
                    label: `${targetEntity} (${r.SchemaName}, many-to-many)`,
                    kind: "ManyToMany",
                    targetEntity,
                    from: "",
                    to: "",
                    intersect: {
                        entityName: r.IntersectEntityName,
                        parentAttribute: parentIntersectAttr,
                        targetAttribute: targetIntersectAttr,
                    },
                });
            }
        } else {
            failedKinds.push("many-to-many");
        }

        if (polymorphic.status === "fulfilled") {
            const existingByTargetAndAttribute = new Set(options.filter((o) => o.kind === "ManyToOne").map((o) => `${o.to}::${o.targetEntity}`));
            for (const option of polymorphic.value) {
                const dedupeKey = `${option.to}::${option.targetEntity}`;
                if (!existingByTargetAndAttribute.has(dedupeKey)) {
                    options.push(option);
                }
            }
        }
        // Polymorphic synthesis failing isn't reported as a load error - it's a best-effort
        // supplement to relationship metadata, not the primary source.

        // Defensive: guarantee no duplicate entries reach the picker regardless of how they arose.
        const seenSchemaNames = new Set<string>();
        const deduped = options.filter((o) => {
            if (seenSchemaNames.has(o.schemaName)) return false;
            seenSchemaNames.add(o.schemaName);
            return true;
        });
        deduped.sort((a, b) => a.label.localeCompare(b.label));
        return {
            relationships: deduped,
            error: failedKinds.length > 0 ? `Failed to load ${failedKinds.join(", ")} relationships - list may be incomplete` : undefined,
        };
    })();

    relationshipCache.set(key, promise);
    promise.catch(() => relationshipCache.delete(key));
    return promise;
}

let allEntityNamesCache: Promise<string[]> | undefined;

/**
 * Fetches (and caches) every table's logical name, for the entity picker when no allowedEntities
 * restriction is configured. Scoped to IsValidForAdvancedFind so system/hidden tables that can't
 * meaningfully be queried via FetchXml don't clutter the list.
 */
export function getAllEntityNames(): Promise<string[]> {
    if (allEntityNamesCache) return allEntityNamesCache;
    const url = `${WEB_API_VERSION_PATH}/EntityDefinitions?$select=LogicalName&$filter=IsValidForAdvancedFind eq true&$orderby=LogicalName`;
    const promise = fetchAllPages<{ LogicalName: string }>(url).then((rows) => rows.map((r) => r.LogicalName));
    allEntityNamesCache = promise;
    promise.catch(() => {
        allEntityNamesCache = undefined;
    });
    return promise;
}

export function clearMetadataCache(): void {
    attributeCache.clear();
    relationshipCache.clear();
    allEntityNamesCache = undefined;
}

export function parseAllowedEntities(raw: string | null | undefined): string[] {
    if (!raw) return [];
    return raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
}

/** Opens the native Dataverse lookup dialog. */
export async function pickLookupValue<TInputs>(
    context: ComponentFramework.Context<TInputs>,
    entityTypes: string[],
    allowMultiSelect = false
): Promise<ComponentFramework.LookupValue[]> {
    return context.utils.lookupObjects({ entityTypes, allowMultiSelect });
}

const entitySetNameCache = new Map<string, Promise<string>>();

/** Resolves an entity's plural EntitySetName (e.g. "account" -> "accounts"), needed to build a raw Web API URL. */
function getEntitySetName(entityLogicalName: string): Promise<string> {
    const key = entityLogicalName.toLowerCase();
    const cached = entitySetNameCache.get(key);
    if (cached) return cached;
    const promise = fetchJson<{ EntitySetName: string }>(
        `${WEB_API_VERSION_PATH}/EntityDefinitions(LogicalName='${encodeURIComponent(key)}')?$select=EntitySetName`
    ).then((r) => r.EntitySetName);
    entitySetNameCache.set(key, promise);
    promise.catch(() => entitySetNameCache.delete(key));
    return promise;
}

const primaryNameAttributeCache = new Map<string, Promise<string | undefined>>();

/** Resolves an entity's primary name attribute (e.g. "account" -> "name"), so a picked record can be shown by its display name instead of its id. */
function getPrimaryNameAttribute(entityLogicalName: string): Promise<string | undefined> {
    const key = entityLogicalName.toLowerCase();
    const cached = primaryNameAttributeCache.get(key);
    if (cached) return cached;
    const promise = fetchJson<{ PrimaryNameAttribute: string | null }>(
        `${WEB_API_VERSION_PATH}/EntityDefinitions(LogicalName='${encodeURIComponent(key)}')?$select=PrimaryNameAttribute`
    ).then((r) => r.PrimaryNameAttribute ?? undefined);
    primaryNameAttributeCache.set(key, promise);
    promise.catch(() => primaryNameAttributeCache.delete(key));
    return promise;
}

export interface IResolvedRecordLabel {
    id: string;
    name?: string;
    entityType: string;
}

/**
 * Resolves the display name for a record id, for rendering a selected lookup/primary-key value as
 * a clickable "name (entity, id)" chip instead of a bare guid. entityTypes lists every entity the
 * id could plausibly belong to (more than one only for polymorphic lookups like owner/customer) -
 * they're tried in order and the first one that actually has the record wins.
 */
export async function resolveRecordLabel<TInputs>(
    context: ComponentFramework.Context<TInputs>,
    entityTypes: string[],
    id: string
): Promise<IResolvedRecordLabel | undefined> {
    for (const entityType of entityTypes) {
        try {
            const primaryNameAttribute = await getPrimaryNameAttribute(entityType);
            const options = primaryNameAttribute ? `?$select=${primaryNameAttribute}` : "";
            const record = await context.webAPI.retrieveRecord(entityType, id, options);
            const name = primaryNameAttribute ? (record as Record<string, unknown>)[primaryNameAttribute] : undefined;
            return { id, name: typeof name === "string" ? name : undefined, entityType };
        } catch {
            // Not this entity type (or the record doesn't exist there) - try the next candidate.
        }
    }
    return undefined;
}

interface IXrmNavigateToGlobal {
    Xrm?: {
        Navigation?: {
            navigateTo?: (pageInput: unknown, navigationOptions?: unknown) => Promise<unknown>;
        };
    };
}

/**
 * Opens a record's form as a dialog centered on screen. PCF's context.navigation has no equivalent
 * of this - openForm can only navigate the main form inline (Microsoft's own docs call this out:
 * "To open the main form in a dialog...use the navigateTo method instead"), and navigateTo itself
 * only exists on the Xrm.Navigation client API, not on the ComponentFramework.Navigation surface
 * exposed to code components. Reaching into window.Xrm is the documented workaround for exactly
 * this gap (Microsoft uses the same pattern for generative pages), so it's used here rather than
 * silently falling back to an inline navigation the caller didn't ask for.
 */
export async function openRecordInDialog<TInputs>(context: ComponentFramework.Context<TInputs>, entityName: string, entityId: string): Promise<void> {
    const xrm = (window as unknown as IXrmNavigateToGlobal).Xrm;
    if (xrm?.Navigation?.navigateTo) {
        await xrm.Navigation.navigateTo({ pageType: "entityrecord", entityName, entityId }, { target: 2, position: 1 });
        return;
    }
    // No window.Xrm (e.g. the PCF test harness) - inline is the only option context.navigation offers.
    await context.navigation.openForm({ entityName, entityId });
}

/**
 * Looks up the Microsoft Entra ID object id for a systemuser record, which is the id the Web API
 * expects (via the CallerObjectId header) to impersonate that user - see
 * https://learn.microsoft.com/power-apps/developer/data-platform/webapi/impersonate-another-user-web-api.
 * Returns undefined if the user has no Entra ID object id on file (e.g. non-interactive/service accounts).
 */
export async function getUserAadObjectId<TInputs>(context: ComponentFramework.Context<TInputs>, systemUserId: string): Promise<string | undefined> {
    const result = await context.webAPI.retrieveRecord("systemuser", systemUserId, "?$select=azureactivedirectoryobjectid");
    const value = (result as { azureactivedirectoryobjectid?: string }).azureactivedirectoryobjectid;
    return value ?? undefined;
}

/**
 * Executes a FetchXML query for real via the Web API and returns the resulting records. When
 * impersonateCallerId is given, bypasses context.webAPI (which has no way to attach custom
 * headers) in favor of a direct fetch carrying the CallerObjectId impersonation header.
 */
export async function runFetchXml<TInputs>(
    context: ComponentFramework.Context<TInputs>,
    entityLogicalName: string,
    fetchXml: string,
    impersonateCallerId?: string
): Promise<ComponentFramework.WebApi.Entity[]> {
    if (!impersonateCallerId) {
        const result = await context.webAPI.retrieveMultipleRecords(entityLogicalName, `?fetchXml=${encodeURIComponent(fetchXml)}`);
        return result.entities;
    }

    const entitySetName = await getEntitySetName(entityLogicalName);
    const response = await fetch(`${WEB_API_VERSION_PATH}/${entitySetName}?fetchXml=${encodeURIComponent(fetchXml)}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            Prefer: 'odata.include-annotations="*"',
            CallerObjectId: impersonateCallerId,
        },
        credentials: "same-origin",
    });
    if (!response.ok) {
        throw new Error(`Query failed (${response.status}) while impersonating`);
    }
    const data = (await response.json()) as { value: ComponentFramework.WebApi.Entity[] };
    return data.value ?? [];
}
