import * as React from "react";
import {
    TabList,
    Tab,
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    Text,
    makeStyles,
    tokens,
} from "@fluentui/react-components";
import { IFetchXmlQuery, createEmptyQuery, createEmptyFilter, collectAliasedEntities, findMissingRequiredFields } from "../models/fetchXmlModel";
import { IPlaceholderDefinition } from "../models/placeholderModel";
import { IRequiredField } from "../models/requiredFieldModel";
import { IRequiredAlias } from "../models/requiredAliasModel";
import { IAttributeMetadata, IEntityRelationshipsResult, IResolvedRecordLabel, IViewOption } from "../services/metadataService";
import { parseFetchXml, buildFetchXml } from "../services/fetchXmlSerializer";
import { collectPlaceholderNames } from "../services/placeholderService";
import { DesignerContext, ILookupValue } from "./designerContext";
import { HelpPopoverButton } from "./HelpPopoverButton";
import { ViewPicker } from "./ViewPicker";
import { SqlPreviewButton } from "./SqlPreviewButton";
import { AiExplainButton } from "./AiExplainButton";
import { IAiExplanation } from "../models/aiExplanationModel";
import { useRequiredAliasIssues } from "./useRequiredAliasIssues";
import { ColumnsTab } from "./design/ColumnsTab";
import { FilterTab } from "./design/FilterTab";
import { EntitySection } from "./design/EntitySection";
import { OptionsSection } from "./design/OptionsSection";
import { XmlTab } from "./xml/XmlTab";
import { TestTab } from "./test/TestTab";

export interface IFetchXmlDesignerProps {
    initialXml: string;
    allowedEntities: string[];
    placeholders: IPlaceholderDefinition[];
    placeholdersError?: string;
    requiredFields: IRequiredField[];
    requiredFieldsError?: string;
    requiredAliases: IRequiredAlias[];
    requiredAliasesError?: string;
    /**
     * Reports the live draft to the host shell on every change, together with whether it's in a
     * state that may be applied. Nothing here writes to the bound column - only Apply does.
     */
    onDraftChange: (xml: string, canApply: boolean) => void;
    getAllEntities: () => Promise<string[]>;
    getAttributes: (entityName: string) => Promise<IAttributeMetadata[]>;
    getRelationships: (entityName: string) => Promise<IEntityRelationshipsResult>;
    /** Active system and personal views of an entity (no lookup, associated or quick find views), to start a query from. */
    getViews: (entityName: string) => Promise<IViewOption[]>;
    pickLookup: (entityTypes: string[], allowMultiSelect?: boolean) => Promise<ILookupValue[]>;
    resolveImpersonationUser: (systemUserId: string) => Promise<string | undefined>;
    resolveLookupLabel: (entityTypes: string[], id: string) => Promise<IResolvedRecordLabel | undefined>;
    openRecord: (entityName: string, id: string) => Promise<void>;
    runQuery: (entityName: string, fetchXml: string, impersonateUserId?: string) => Promise<Record<string, unknown>[]>;
    /** Translates FetchXML to T-SQL via the FetchXMLToSQL custom API. */
    convertToSql: (fetchXml: string, subqueryCompatible: boolean) => Promise<string>;
    /** Explains FetchXML in plain language via the AI Builder prompt (msdyn_aimodel Predict). */
    explainFetchXml: (fetchXml: string) => Promise<IAiExplanation>;
    /** Raw value of the bound "explaining" column (the last saved explanation). */
    savedExplanation?: string;
    /** Writes to the "explaining" column right away (independent of Apply). Omitted when read-only. */
    onSaveExplanation?: (value: string) => void;
    /** "design": Columns/Filter beside the XML. "test": the whole area goes to the Test page (driven by the dialog footer). */
    view: DesignerView;
    /** Bumped by the footer's Run Test button; each new value runs the test query once. */
    runToken: number;
}

export type DesignerView = "design" | "test";

type TabKey = "columns" | "filter";

const useStyles = makeStyles({
    // Editor (Columns/Filter) 60%, live XML 40%.
    grid: {
        flex: 1,
        minHeight: 0,
        display: "grid",
        gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
        gridTemplateRows: "minmax(0, 1fr)",
        gap: "8px",
        "@media (max-width: 900px)": {
            gridTemplateColumns: "minmax(0, 1fr)",
            gridTemplateRows: "minmax(400px, auto) minmax(300px, auto)",
            overflowY: "auto",
        },
    },
    pane: {
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        minWidth: 0,
    },
    paneHeader: {
        display: "flex",
        alignItems: "center",
        minHeight: "32px",
        paddingLeft: "8px",
    },
    paneBody: {
        flex: 1,
        minHeight: 0,
        overflow: "auto",
        padding: "0 6px",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        borderRadius: tokens.borderRadiusMedium,
    },
    toolbar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "8px",
        paddingBottom: "6px",
    },
    toolbarGroup: {
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
    },
});

export const FetchXmlDesigner: React.FC<IFetchXmlDesignerProps> = (props) => {
    const {
        initialXml,
        allowedEntities,
        placeholders,
        placeholdersError,
        requiredFields,
        requiredFieldsError,
        requiredAliases,
        requiredAliasesError,
        onDraftChange,
        getAllEntities,
        getAttributes,
        getRelationships,
        getViews,
        pickLookup,
        resolveImpersonationUser,
        resolveLookupLabel,
        openRecord,
        runQuery,
        convertToSql,
        explainFetchXml,
        savedExplanation,
        onSaveExplanation,
        view,
        runToken,
    } = props;
    const styles = useStyles();

    // Seeded once from the bound value; all further edits live in local state and flow
    // out via onChange, so external re-renders never clobber in-progress editing.
    const [initialParseError] = React.useState<string | undefined>(() => parseFetchXml(initialXml, placeholders.map((p) => p.name)).error);
    const [query, setQuery] = React.useState<IFetchXmlQuery>(() => parseFetchXml(initialXml, placeholders.map((p) => p.name)).query ?? createEmptyQuery());
    const [selectedTab, setSelectedTab] = React.useState<TabKey>("columns");

    // Alert-only: lists configured required fields missing from the query, without ever mutating
    // it or blocking save - the maker adds the column themselves via the Columns tab.
    const missingRequiredFields = React.useMemo(() => findMissingRequiredFields(query, requiredFields), [query, requiredFields]);

    // Alert-only, like missingRequiredFields above: resolves live attribute metadata to confirm each
    // configured alias is present in the query and bound to an attribute of an allowed type.
    const requiredAliasIssues = useRequiredAliasIssues(query, requiredAliases, getAttributes);

    const xml = React.useMemo(() => buildFetchXml(query), [query]);
    const aliasedEntities = React.useMemo(() => collectAliasedEntities(query), [query]);

    const usedPlaceholderNames = React.useMemo(() => collectPlaceholderNames(query), [query]);
    const missingRequiredPlaceholders = React.useMemo(
        () => placeholders.filter((p) => p.required && !usedPlaceholderNames.includes(p.name)),
        [placeholders, usedPlaceholderNames]
    );

    // A PCF control can't hook into the host form's save pipeline directly (form context isn't
    // exposed to code components), so a required-but-unused placeholder is enforced here instead:
    // the draft is still reported, but flagged as not applicable, which greys out Apply.
    React.useEffect(() => {
        onDraftChange(xml, missingRequiredPlaceholders.length === 0);
    }, [xml, onDraftChange, missingRequiredPlaceholders.length]);

    const contextValue = React.useMemo(
        () => ({
            allowedEntities,
            placeholders,
            requiredFields,
            aliasedEntities,
            getAllEntities,
            getAttributes,
            getRelationships,
            pickLookup,
            resolveImpersonationUser,
            resolveLookupLabel,
            openRecord,
        }),
        [
            allowedEntities,
            placeholders,
            requiredFields,
            aliasedEntities,
            getAllEntities,
            getAttributes,
            getRelationships,
            pickLookup,
            resolveImpersonationUser,
            resolveLookupLabel,
            openRecord,
        ]
    );

    // Picking a different root entity starts the query over - every column, filter and join belonged to the old one.
    const handleEntityChange = (entityName: string): void =>
        setQuery((prev) =>
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
        );

    const handleApplyRawXml = (rawXml: string): { success: boolean; error?: string } => {
        const result = parseFetchXml(rawXml, placeholders.map((p) => p.name));
        if (result.error) {
            return { success: false, error: result.error };
        }
        setQuery(result.query ?? createEmptyQuery());
        return { success: true };
    };

    return (
        <DesignerContext.Provider value={contextValue}>
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div>
                    {initialParseError && (
                        <MessageBar intent="warning">
                            <MessageBarBody>
                                <MessageBarTitle>Could not parse the existing FetchXML</MessageBarTitle>
                                {`Starting from a blank query. Original error: ${initialParseError}`}
                            </MessageBarBody>
                        </MessageBar>
                    )}
                    {placeholdersError && (
                        <MessageBar intent="warning">
                            <MessageBarBody>
                                <MessageBarTitle>Placeholders configuration issue</MessageBarTitle>
                                {placeholdersError}
                            </MessageBarBody>
                        </MessageBar>
                    )}
                    {requiredFieldsError && (
                        <MessageBar intent="warning">
                            <MessageBarBody>
                                <MessageBarTitle>Required fields configuration issue</MessageBarTitle>
                                {requiredFieldsError}
                            </MessageBarBody>
                        </MessageBar>
                    )}
                    {requiredAliasesError && (
                        <MessageBar intent="warning">
                            <MessageBarBody>
                                <MessageBarTitle>Required alias configuration issue</MessageBarTitle>
                                {requiredAliasesError}
                            </MessageBarBody>
                        </MessageBar>
                    )}
                    {missingRequiredPlaceholders.length > 0 && (
                        <MessageBar intent="error">
                            <MessageBarBody>
                                <MessageBarTitle>Required placeholders not used yet</MessageBarTitle>
                                {`These placeholders are marked required but aren't referenced by any condition, so this query can't be saved yet: ${missingRequiredPlaceholders
                                    .map((p) => p.name)
                                    .join(", ")}`}
                            </MessageBarBody>
                        </MessageBar>
                    )}
                    {missingRequiredFields.length > 0 && (
                        <MessageBar intent="warning">
                            <MessageBarBody>
                                <MessageBarTitle>Required columns missing</MessageBarTitle>
                                {`Add these via the Columns tab - this doesn't block saving: ${missingRequiredFields
                                    .map((f) => `${f.entityLabel}.${f.attribute}`)
                                    .join(", ")}`}
                            </MessageBarBody>
                        </MessageBar>
                    )}
                    {requiredAliasIssues.length > 0 && (
                        <MessageBar intent="warning">
                            <MessageBarBody>
                                <MessageBarTitle>Required alias issues</MessageBarTitle>
                                {`This doesn't block saving: ${requiredAliasIssues
                                    .map((issue) =>
                                        issue.kind === "missing"
                                            ? `alias "${issue.alias}" not found in the query`
                                            : `alias "${issue.alias}" (${issue.entityLabel}.${issue.attribute}) is type ${issue.actualType ?? "unknown"}, not an allowed binding`
                                    )
                                    .join("; ")}`}
                            </MessageBarBody>
                        </MessageBar>
                    )}
                </div>

                <div className={styles.toolbar}>
                    <div className={styles.toolbarGroup}>
                        <EntitySection label="Entity" value={query.entityName} onChange={handleEntityChange} />
                        <ViewPicker entityName={query.entityName} getViews={getViews} onLoad={handleApplyRawXml} />
                        <OptionsSection query={query} onChange={setQuery} />
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                        <AiExplainButton
                            fetchXml={xml}
                            disabled={!query.entityName}
                            explainFetchXml={explainFetchXml}
                            savedExplanation={savedExplanation}
                            onSaveExplanation={onSaveExplanation}
                        />
                        <SqlPreviewButton fetchXml={xml} disabled={!query.entityName} convertToSql={convertToSql} />
                        <HelpPopoverButton label="Placeholders" title="Placeholders JSON schema">
                            <Text size={200}>
                                Array of objects, each defining a token that can be dropped into a condition value instead of a literal:
                            </Text>
                            <Text size={200} font="monospace">
                                {'[{ "name": "anchorid", "type": "guid", "entityName": "account", "attributeName": "industrycode", "required": true }]'}
                            </Text>
                            <Text size={200}>
                                name and type are required. type is one of guid, lookup, optionset, decimal, string, boolean, datetime. entityName and attributeName are
                                optional - when set they also restrict where the placeholder can be picked, to conditions on that exact entity/attribute; leave them
                                out to allow the placeholder anywhere. required is optional (defaults to false); when true, the query can&apos;t be saved until a
                                condition actually uses this placeholder.
                            </Text>
                            <Text size={200}>
                                {'name is written into the FetchXml exactly as given - there\'s no fixed delimiter, so use whatever syntax fits your convention (e.g. "anchorid", "${anchorid}", "[[anchorid]]").'}
                            </Text>
                            <Text size={200} weight="semibold">
                                Currently configured on this control:
                            </Text>
                            {placeholders.length === 0 ? (
                                <Text size={200} italic>
                                    None
                                </Text>
                            ) : (
                                placeholders.map((p) => (
                                    <Text key={p.name} size={200} font="monospace">
                                        {`${p.name} (${p.type}${p.entityName ? `, entity=${p.entityName}` : ""}${p.attributeName ? `, attribute=${p.attributeName}` : ""}${
                                            p.required ? ", required" : ""
                                        })`}
                                    </Text>
                                ))
                            )}
                        </HelpPopoverButton>
                        <HelpPopoverButton label="Required Fields" title="Required Fields JSON schema">
                            <Text size={200}>Array of columns that must always be included whenever their entity is present in the query:</Text>
                            <Text size={200} font="monospace">
                                {'[{ "entity": "account", "attribute": "name", "alias": "ac.name" }, { "attribute": "statecode" }]'}
                            </Text>
                            <Text size={200}>
                                attribute is required. entity is optional and defaults to the root entity when omitted, or names a related link entity. alias is
                                optional to specify, but is always applied when given. This never creates a new related entity - it only fills in columns on ones
                                already in the query.
                            </Text>
                            <Text size={200} weight="semibold">
                                Currently configured on this control:
                            </Text>
                            {requiredFields.length === 0 ? (
                                <Text size={200} italic>
                                    None
                                </Text>
                            ) : (
                                requiredFields.map((rf, idx) => (
                                    <Text key={`${rf.entity ?? "root"}.${rf.attribute}.${idx}`} size={200} font="monospace">
                                        {`${rf.entity ?? "(root)"}.${rf.attribute}${rf.alias ? ` alias=${rf.alias}` : ""}`}
                                    </Text>
                                ))
                            )}
                        </HelpPopoverButton>
                        <HelpPopoverButton label="Required Alias" title="Required Alias JSON schema">
                            <Text size={200}>
                                Array of output aliases that must be present somewhere in the query, bound to an attribute of an allowed type:
                            </Text>
                            <Text size={200} font="monospace">
                                {'[{ "alias": "id", "binding": ["id", "string", "decimal", "integer", "long", "float", "double", "boolean", "lookup"] }, { "alias": "label", "binding": ["string"] }]'}
                            </Text>
                            <Text size={200}>
                                alias and binding are both required. alias is the output alias to look for (e.g. the value used in{" "}
                                {'<attribute name="..." alias="id" />'}), anywhere in the query - root entity or any link entity. binding is one or more of id, string,
                                decimal, integer, long, float, double, boolean, lookup - the attribute&apos;s resolved type must be one of these. This never blocks
                                saving; it only shows a warning listing aliases that are missing or bound to a disallowed type.
                            </Text>
                            <Text size={200} weight="semibold">
                                Currently configured on this control:
                            </Text>
                            {requiredAliases.length === 0 ? (
                                <Text size={200} italic>
                                    None
                                </Text>
                            ) : (
                                requiredAliases.map((ra, idx) => (
                                    <Text key={`${ra.alias}.${idx}`} size={200} font="monospace">
                                        {`${ra.alias}: ${ra.binding.join(", ")}`}
                                    </Text>
                                ))
                            )}
                        </HelpPopoverButton>
                    </div>
                </div>

                {/* Both views stay mounted and are only hidden, so switching back and forth keeps
                    unsaved raw XML, placeholder values, impersonation and the last results. */}
                <div className={styles.grid} style={view === "test" ? { display: "none" } : undefined}>
                    <div className={styles.pane}>
                        <TabList size="small" selectedValue={selectedTab} onTabSelect={(_, data) => setSelectedTab(data.value as TabKey)}>
                            <Tab value="columns">Columns</Tab>
                            <Tab value="filter">Filter</Tab>
                        </TabList>
                        <div className={styles.paneBody}>
                            {selectedTab === "columns" && <ColumnsTab query={query} onChange={setQuery} />}
                            {selectedTab === "filter" && <FilterTab query={query} onChange={setQuery} />}
                        </div>
                    </div>

                    <div className={styles.pane}>
                        <div className={styles.paneHeader}>
                            <Text weight="semibold">XML</Text>
                        </div>
                        <div className={styles.paneBody}>
                            <XmlTab xml={xml} onApplyRawXml={handleApplyRawXml} />
                        </div>
                    </div>
                </div>

                <div className={styles.pane} style={{ flex: 1, display: view === "test" ? "flex" : "none" }}>
                    <div className={styles.paneBody}>
                        <TestTab
                            query={query}
                            templateXml={xml}
                            placeholders={placeholders}
                            runToken={runToken}
                            onRun={(resolvedXml, entityName, impersonateUserId) => runQuery(entityName, resolvedXml, impersonateUserId)}
                        />
                    </div>
                </div>
            </div>
        </DesignerContext.Provider>
    );
};
