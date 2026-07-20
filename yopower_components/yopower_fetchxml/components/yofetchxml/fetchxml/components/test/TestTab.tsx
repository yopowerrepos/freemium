import * as React from "react";
import { Button, Spinner, MessageBar, MessageBarBody, MessageBarTitle, Accordion, AccordionItem, AccordionHeader, AccordionPanel, Text, Checkbox, Input } from "@fluentui/react-components";
import { IFetchXmlQuery } from "../../models/fetchXmlModel";
import { IPlaceholderDefinition } from "../../models/placeholderModel";
import { collectPlaceholderNames, resolveFetchXmlTemplate } from "../../services/placeholderService";
import { useDesignerContext } from "../designerContext";
import { PlaceholderValueInput } from "./PlaceholderValueInput";
import { ResultsGrid } from "./ResultsGrid";
import { COMPACT_FIELD_PROPS, COMPACT_HEIGHT_STYLE } from "../design/treeStyles";

export interface ITestTabProps {
    query: IFetchXmlQuery;
    templateXml: string;
    placeholders: IPlaceholderDefinition[];
    onRun: (resolvedXml: string, entityName: string, impersonateUserId?: string) => Promise<Record<string, unknown>[]>;
}

export const TestTab: React.FC<ITestTabProps> = ({ query, templateXml, placeholders, onRun }) => {
    const { pickLookup, resolveImpersonationUser } = useDesignerContext();
    const usedNames = React.useMemo(() => collectPlaceholderNames(query), [query]);
    const [values, setValues] = React.useState<Record<string, string>>({});
    const [results, setResults] = React.useState<Record<string, unknown>[] | undefined>(undefined);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | undefined>(undefined);
    const [formatted, setFormatted] = React.useState(true);
    const [impersonate, setImpersonate] = React.useState(false);
    const [impersonateUser, setImpersonateUser] = React.useState<{ id: string; name: string } | undefined>(undefined);

    const definedByName = React.useMemo(() => new Map(placeholders.map((p) => [p.name, p])), [placeholders]);
    const unresolvedNames = usedNames.filter((n) => !definedByName.has(n));
    const resolvedXml = React.useMemo(() => resolveFetchXmlTemplate(templateXml, values), [templateXml, values]);

    const handlePickImpersonateUser = async (): Promise<void> => {
        const picked = await pickLookup(["systemuser"]);
        if (!picked[0]) return;
        setImpersonateUser({ id: picked[0].id.replace(/[{}]/g, ""), name: picked[0].name ?? picked[0].id });
    };

    const handleRun = async (): Promise<void> => {
        setLoading(true);
        setError(undefined);
        try {
            let callerId: string | undefined;
            if (impersonate && impersonateUser) {
                callerId = await resolveImpersonationUser(impersonateUser.id);
                if (!callerId) {
                    setError(`Could not resolve an Azure AD Object Id for "${impersonateUser.name}" - this user can't be impersonated.`);
                    setResults(undefined);
                    return;
                }
            }
            const entities = await onRun(resolvedXml, query.entityName, callerId);
            setResults(entities);
        } catch (e) {
            setError((e as Error)?.message ?? "Failed to run query");
            setResults(undefined);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "8px 0" }}>
            {usedNames.length === 0 && <Text italic>This query has no placeholders. It will run as-is.</Text>}

            {unresolvedNames.length > 0 && (
                <MessageBar intent="warning">
                    <MessageBarBody>
                        <MessageBarTitle>Undefined placeholders</MessageBarTitle>
                        {`These placeholders are used in the query but not configured: ${unresolvedNames.join(", ")}`}
                    </MessageBarBody>
                </MessageBar>
            )}

            {usedNames
                .filter((n) => definedByName.has(n))
                .map((name) => {
                    const def = definedByName.get(name)!;
                    return <PlaceholderValueInput key={name} placeholder={def} value={values[name] ?? ""} onChange={(v) => setValues((prev) => ({ ...prev, [name]: v }))} />;
                })}

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
                <Checkbox label="Run as another user (impersonate)" checked={impersonate} onChange={(_, data) => setImpersonate(!!data.checked)} />
                {impersonate && (
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        <Input
                            {...COMPACT_FIELD_PROPS}
                            readOnly
                            value={impersonateUser?.name ?? ""}
                            placeholder="No user selected"
                            style={{ minWidth: "180px", ...COMPACT_HEIGHT_STYLE }}
                        />
                        <Button
                            size="small"
                            appearance="subtle"
                            style={COMPACT_HEIGHT_STYLE}
                            onClick={() => {
                                handlePickImpersonateUser().catch(() => undefined);
                            }}
                        >
                            Select...
                        </Button>
                        {impersonateUser && (
                            <Button size="small" appearance="subtle" style={COMPACT_HEIGHT_STYLE} onClick={() => setImpersonateUser(undefined)} aria-label="Clear impersonated user">
                                ✕
                            </Button>
                        )}
                    </div>
                )}
                <Checkbox label="Show formatted values" checked={formatted} onChange={(_, data) => setFormatted(!!data.checked)} />
            </div>

            <div>
                <Button
                    size="small"
                    style={COMPACT_HEIGHT_STYLE}
                    appearance="primary"
                    disabled={!query.entityName || loading || (impersonate && !impersonateUser)}
                    onClick={() => {
                        handleRun().catch(() => undefined);
                    }}
                >
                    {loading ? "Running..." : "Run Test Query"}
                </Button>
                {loading && <Spinner size="tiny" style={{ marginLeft: "8px" }} />}
            </div>

            {error && (
                <MessageBar intent="error">
                    <MessageBarBody>
                        <MessageBarTitle>Query failed</MessageBarTitle>
                        {error}
                    </MessageBarBody>
                </MessageBar>
            )}

            <Accordion collapsible defaultOpenItems={["resolved-xml"]}>
                <AccordionItem value="resolved-xml">
                    <AccordionHeader>Resolved FetchXML</AccordionHeader>
                    <AccordionPanel>
                        <pre style={{ fontFamily: "monospace", fontSize: "12px", whiteSpace: "pre-wrap" }}>{resolvedXml}</pre>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>

            {results && <ResultsGrid records={results} formatted={formatted} />}
        </div>
    );
};
