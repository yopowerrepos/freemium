import * as React from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    Spinner,
    Text,
    makeStyles,
    tokens,
} from "@fluentui/react-components";
import { IAiExplanation, ISavedExplanation, parseSavedExplanation, serializeSavedExplanation } from "../models/aiExplanationModel";

export interface IAiExplainButtonProps {
    /** The current (draft) query. */
    fetchXml: string;
    disabled?: boolean;
    explainFetchXml: (fetchXml: string) => Promise<IAiExplanation>;
    /** Raw value of the "explaining" column - the last saved explanation, shown on open instead of asking the AI again. */
    savedExplanation?: string;
    /** Writes the explanation to the "explaining" column. Omitted when the control is read-only, which hides Save. */
    onSaveExplanation?: (value: string) => void;
}

const useStyles = makeStyles({
    surface: {
        width: "min(720px, calc(100vw - 64px))",
        maxWidth: "min(720px, calc(100vw - 64px))",
        padding: "12px 16px",
    },
    content: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    explanation: {
        margin: 0,
        padding: "10px 12px",
        maxHeight: "50vh",
        overflow: "auto",
        whiteSpace: "pre-wrap",
        lineHeight: tokens.lineHeightBase300,
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusMedium,
    },
    stats: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: "8px",
    },
    stat: {
        display: "flex",
        flexDirection: "column",
        padding: "6px 8px",
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        borderRadius: tokens.borderRadiusMedium,
    },
    statValue: {
        fontVariantNumeric: "tabular-nums",
    },
    meta: {
        color: tokens.colorNeutralForeground3,
    },
});

const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
    const styles = useStyles();
    return (
        <div className={styles.stat}>
            <Text size={100} className={styles.meta}>
                {label}
            </Text>
            <Text size={300} weight="semibold" className={styles.statValue}>
                {value}
            </Text>
        </div>
    );
};

const formatNumber = (n: number): string => n.toLocaleString();

const formatDate = (iso: string): string | undefined => {
    if (!iso) return undefined;
    const date = new Date(iso);
    return isNaN(date.getTime()) ? undefined : date.toLocaleString();
};

/**
 * "Explain" toolbar button: shows the saved explanation of the query from the "explaining" column,
 * and lets the user ask the AI Builder prompt again (Refresh), copy it, or save a new one back.
 * Each prediction costs AI Builder credits, so the AI is only called on Refresh - or on open when
 * nothing has been saved yet.
 */
export const AiExplainButton: React.FC<IAiExplainButtonProps> = ({ fetchXml, disabled, explainFetchXml, savedExplanation, onSaveExplanation }) => {
    const styles = useStyles();
    const [open, setOpen] = React.useState(false);
    const [current, setCurrent] = React.useState<ISavedExplanation | undefined>(undefined);
    // True while the shown explanation is a fresh AI result that hasn't been saved to the column.
    const [unsaved, setUnsaved] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | undefined>(undefined);
    const [copied, setCopied] = React.useState(false);
    const [saved, setSaved] = React.useState(false);

    // Read through refs so a slow response never lands in a dialog that was closed (or refreshed) meanwhile.
    const fetchXmlRef = React.useRef(fetchXml);
    fetchXmlRef.current = fetchXml;
    const requestRef = React.useRef(0);

    const runExplain = React.useCallback((): void => {
        const requestId = ++requestRef.current;
        const xml = fetchXmlRef.current;
        setLoading(true);
        setError(undefined);
        explainFetchXml(xml)
            .then((result) => {
                if (requestId !== requestRef.current) return undefined;
                setCurrent({ ...result, fetchXml: xml, generatedAt: new Date().toISOString() });
                setUnsaved(true);
                setLoading(false);
                return undefined;
            })
            .catch((e: Error) => {
                if (requestId !== requestRef.current) return;
                setError(e?.message ?? "Failed to explain the query");
                setLoading(false);
            });
    }, [explainFetchXml]);

    const handleOpenChange = (isOpen: boolean): void => {
        if (isOpen) {
            const stored = parseSavedExplanation(savedExplanation);
            setCurrent(stored);
            setUnsaved(false);
            setError(undefined);
            setSaved(false);
            setLoading(false);
            if (!stored) runExplain();
        } else {
            requestRef.current++;
        }
        setOpen(isOpen);
    };

    const handleCopy = async (): Promise<void> => {
        if (!current?.text) return;
        try {
            await navigator.clipboard.writeText(current.text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // clipboard may be unavailable in this hosting context; nothing to recover
        }
    };

    const handleSave = (): void => {
        if (!current || !onSaveExplanation) return;
        onSaveExplanation(serializeSavedExplanation(current));
        setUnsaved(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    // Plain-text values (no recorded query) can't be compared, so they're never flagged.
    const outdated = !!current?.fetchXml && current.fetchXml !== fetchXml;
    const generatedAt = current ? formatDate(current.generatedAt) : undefined;
    const hasUsage = !!current && current.tokens.total > 0;

    return (
        <Dialog open={open} onOpenChange={(_, data) => handleOpenChange(data.open)}>
            <DialogTrigger disableButtonEnhancement>
                <Button size="small" appearance="subtle" disabled={disabled}>
                    Explain
                </Button>
            </DialogTrigger>
            <DialogSurface className={styles.surface}>
                <DialogBody>
                    <DialogTitle>AI Query Explanation</DialogTitle>
                    <DialogContent className={styles.content}>
                        {loading && <Spinner size="tiny" label="Asking AI to explain the query..." />}
                        {error && (
                            <MessageBar intent="error">
                                <MessageBarBody>
                                    <MessageBarTitle>Could not explain the query</MessageBarTitle>
                                    {error}
                                </MessageBarBody>
                            </MessageBar>
                        )}
                        {current && outdated && !loading && (
                            <MessageBar intent="warning">
                                <MessageBarBody>
                                    <MessageBarTitle>Outdated</MessageBarTitle>
                                    The query has changed since this explanation was generated. Refresh to explain the current version.
                                </MessageBarBody>
                            </MessageBar>
                        )}
                        {current && (
                            <>
                                <p className={styles.explanation}>{current.text}</p>
                                {current.finishReason && current.finishReason !== "stop" && (
                                    <MessageBar intent="warning">
                                        <MessageBarBody>{`The response may be incomplete (finish reason: ${current.finishReason}).`}</MessageBarBody>
                                    </MessageBar>
                                )}
                                {hasUsage && (
                                    <div className={styles.stats}>
                                        <Stat label="Prompt tokens" value={formatNumber(current.tokens.prompt)} />
                                        <Stat label="Completion tokens" value={formatNumber(current.tokens.completion)} />
                                        <Stat label="Total tokens" value={formatNumber(current.tokens.total)} />
                                        <Stat label="AI Builder credits" value={formatNumber(current.costAsAiBuilderCredits)} />
                                        {current.costAsCopilotCredits > 0 && <Stat label="Copilot credits" value={formatNumber(current.costAsCopilotCredits)} />}
                                    </div>
                                )}
                                <Text size={100} className={styles.meta}>
                                    {[
                                        unsaved ? "Not saved yet" : "Saved",
                                        generatedAt && `Generated: ${generatedAt}`,
                                        current.modelName && `Model: ${current.modelName}`,
                                        current.finishReason && `Finish reason: ${current.finishReason}`,
                                        current.predictionId && `Prediction: ${current.predictionId}`,
                                    ]
                                        .filter(Boolean)
                                        .join("  ·  ")}
                                </Text>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions position="start">
                        <Button appearance="secondary" disabled={loading} onClick={runExplain}>
                            Refresh
                        </Button>
                    </DialogActions>
                    <DialogActions>
                        <Button
                            appearance="secondary"
                            disabled={!current?.text}
                            onClick={() => {
                                handleCopy().catch(() => undefined);
                            }}
                        >
                            {copied ? "Copied!" : "Copy"}
                        </Button>
                        {onSaveExplanation && (
                            <Button appearance="primary" disabled={!current || !unsaved || loading} onClick={handleSave}>
                                {saved ? "Saved!" : "Save"}
                            </Button>
                        )}
                        <DialogTrigger disableButtonEnhancement>
                            <Button appearance="secondary">Close</Button>
                        </DialogTrigger>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
