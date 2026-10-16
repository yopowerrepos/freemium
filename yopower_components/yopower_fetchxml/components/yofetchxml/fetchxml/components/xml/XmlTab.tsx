import * as React from "react";
import { Button, Textarea, MessageBar, MessageBarBody, MessageBarTitle, Checkbox, makeStyles } from "@fluentui/react-components";
import { COMPACT_HEIGHT_STYLE } from "../design/treeStyles";

export interface IXmlTabProps {
    xml: string;
    onApplyRawXml: (xml: string) => { success: boolean; error?: string };
}

/** The pane around it already frames the XML, so the textarea drops its own border and focus underline. */
const useStyles = makeStyles({
    borderless: {
        border: "none",
        "::after": { display: "none" },
    },
});

export const XmlTab: React.FC<IXmlTabProps> = ({ xml, onApplyRawXml }) => {
    const styles = useStyles();
    const [editing, setEditing] = React.useState(false);
    const [draft, setDraft] = React.useState(xml);
    const [error, setError] = React.useState<string | undefined>(undefined);
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        if (!editing) {
            setDraft(xml);
        }
    }, [xml, editing]);

    const handleApply = (): void => {
        const result = onApplyRawXml(draft);
        if (result.success) {
            setError(undefined);
            setEditing(false);
        } else {
            setError(result.error ?? "Invalid FetchXML");
        }
    };

    const handleCopy = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(xml);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // clipboard may be unavailable in this hosting context; nothing to recover
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "6px 0", flex: 1, minHeight: 0 }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Checkbox
                    label="Edit raw XML"
                    checked={editing}
                    onChange={(_, data) => {
                        setEditing(!!data.checked);
                        setError(undefined);
                        setDraft(xml);
                    }}
                />
                <Button
                    size="small"
                    style={COMPACT_HEIGHT_STYLE}
                    onClick={() => {
                        handleCopy().catch(() => undefined);
                    }}
                >
                    {copied ? "Copied!" : "Copy"}
                </Button>
                {editing && (
                    <Button size="small" appearance="primary" style={COMPACT_HEIGHT_STYLE} onClick={handleApply}>
                        Apply
                    </Button>
                )}
            </div>

            {error && (
                <MessageBar intent="error">
                    <MessageBarBody>
                        <MessageBarTitle>Could not parse FetchXML</MessageBarTitle>
                        {error}
                    </MessageBarBody>
                </MessageBar>
            )}

            {/* Pinned to a positioned box so the inner <textarea> gets a definite height to fill -
                with a percentage height alone it fell back to its intrinsic rows and clipped mid-pane. */}
            <div style={{ position: "relative", flex: 1, minHeight: "200px" }}>
                <Textarea
                    value={editing ? draft : xml}
                    readOnly={!editing}
                    onChange={(_, data) => setDraft(data.value)}
                    resize="none"
                    className={styles.borderless}
                    style={{ position: "absolute", inset: 0, display: "flex" }}
                    textarea={{ style: { fontFamily: "monospace", fontSize: "11px", whiteSpace: "pre", flex: 1, height: "100%", maxHeight: "none" } }}
                />
            </div>
        </div>
    );
};
