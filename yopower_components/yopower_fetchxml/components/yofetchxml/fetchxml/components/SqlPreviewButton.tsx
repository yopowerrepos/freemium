import * as React from "react";
import {
    Button,
    Checkbox,
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
    makeStyles,
    tokens,
} from "@fluentui/react-components";

export interface ISqlPreviewButtonProps {
    /** The current query, converted on each open (and whenever the subquery option changes). */
    fetchXml: string;
    disabled?: boolean;
    convertToSql: (fetchXml: string, subqueryCompatible: boolean) => Promise<string>;
}

const useStyles = makeStyles({
    surface: {
        width: "min(900px, calc(100vw - 64px))",
        maxWidth: "min(900px, calc(100vw - 64px))",
        padding: "12px 16px",
    },
    sql: {
        margin: 0,
        padding: "8px",
        maxHeight: "60vh",
        overflow: "auto",
        fontFamily: "monospace",
        fontSize: "11px",
        whiteSpace: "pre",
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusMedium,
    },
});

/** "SQL" toolbar button: shows the FetchXMLToSQL custom API's translation of the query in a modal, ready to copy. */
export const SqlPreviewButton: React.FC<ISqlPreviewButtonProps> = ({ fetchXml, disabled, convertToSql }) => {
    const styles = useStyles();
    const [open, setOpen] = React.useState(false);
    const [subqueryCompatible, setSubqueryCompatible] = React.useState(true);
    const [sql, setSql] = React.useState<string | undefined>(undefined);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | undefined>(undefined);
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        if (!open) return undefined;
        let cancelled = false;
        setLoading(true);
        setError(undefined);
        setSql(undefined);
        convertToSql(fetchXml, subqueryCompatible)
            .then((result) => {
                if (!cancelled) {
                    setSql(result);
                    setLoading(false);
                }
                return undefined;
            })
            .catch((e: Error) => {
                if (!cancelled) {
                    setError(e?.message ?? "Failed to convert FetchXML to SQL");
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [open, fetchXml, subqueryCompatible, convertToSql]);

    const handleCopy = async (): Promise<void> => {
        if (!sql) return;
        try {
            await navigator.clipboard.writeText(sql);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // clipboard may be unavailable in this hosting context; nothing to recover
        }
    };

    return (
        <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
            <DialogTrigger disableButtonEnhancement>
                <Button size="small" appearance="subtle" disabled={disabled}>
                    SQL
                </Button>
            </DialogTrigger>
            <DialogSurface className={styles.surface}>
                <DialogBody>
                    <DialogTitle>SQL Query</DialogTitle>
                    <DialogContent style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Checkbox label="Subquery compatible" checked={subqueryCompatible} onChange={(_, data) => setSubqueryCompatible(!!data.checked)} />
                        {loading && <Spinner size="tiny" label="Converting..." />}
                        {error && (
                            <MessageBar intent="error">
                                <MessageBarBody>
                                    <MessageBarTitle>Could not convert to SQL</MessageBarTitle>
                                    {error}
                                </MessageBarBody>
                            </MessageBar>
                        )}
                        {sql !== undefined && <pre className={styles.sql}>{sql}</pre>}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            appearance="primary"
                            disabled={!sql}
                            onClick={() => {
                                handleCopy().catch(() => undefined);
                            }}
                        >
                            {copied ? "Copied!" : "Copy"}
                        </Button>
                        <DialogTrigger disableButtonEnhancement>
                            <Button appearance="secondary">Close</Button>
                        </DialogTrigger>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
