import * as React from "react";
import { Button, Textarea, MessageBar, MessageBarBody, MessageBarTitle, Checkbox } from "@fluentui/react-components";
import { COMPACT_HEIGHT_STYLE } from "../design/treeStyles";

export interface IXmlTabProps {
    xml: string;
    onApplyRawXml: (xml: string) => { success: boolean; error?: string };
}

export const XmlTab: React.FC<IXmlTabProps> = ({ xml, onApplyRawXml }) => {
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
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "8px 0", flex: 1, minHeight: 0 }}>
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

            <Textarea
                value={editing ? draft : xml}
                readOnly={!editing}
                onChange={(_, data) => setDraft(data.value)}
                resize="none"
                style={{ flex: 1, minHeight: "400px", height: "100%" }}
                textarea={{ style: { fontFamily: "monospace", fontSize: "12px", whiteSpace: "pre", height: "100%" } }}
            />
        </div>
    );
};
