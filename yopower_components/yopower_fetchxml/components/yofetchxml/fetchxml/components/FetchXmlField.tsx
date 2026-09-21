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
    FluentProvider,
    IdPrefixProvider,
    Tooltip,
    makeStyles,
    webLightTheme,
} from "@fluentui/react-components";
import { FetchXmlDesigner, IFetchXmlDesignerProps } from "./FetchXmlDesigner";

/**
 * Fluent's Code (24 Regular) glyph, inlined rather than imported from @fluentui/react-icons:
 * that package resolves to a @griffel/react build that needs react/jsx-runtime, which the
 * React 16.14 platform library doesn't ship, and the bundle fails to compile.
 */
const CodeIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <path d="m8.07 18.94 6.5-14.5a.75.75 0 0 1 1.4.52l-.04.1-6.5 14.5a.75.75 0 0 1-1.4-.52l.04-.1 6.5-14.5-6.5 14.5Zm-5.85-7.47 4.25-4.25a.75.75 0 0 1 1.13.98l-.07.08L3.81 12l3.72 3.72a.75.75 0 0 1-.98 1.13l-.08-.07-4.25-4.25a.75.75 0 0 1-.07-.98l.07-.08 4.25-4.25-4.25 4.25Zm14.25-4.25a.75.75 0 0 1 .98-.07l.08.07 4.25 4.25c.27.27.3.68.07.98l-.07.08-4.25 4.25a.75.75 0 0 1-1.13-.98l.07-.08L20.19 12l-3.72-3.72a.75.75 0 0 1 0-1.06Z" />
    </svg>
);

export interface IFetchXmlFieldProps extends Omit<IFetchXmlDesignerProps, "onDraftChange"> {
    /** Commits the draft to the bound column. Only ever called from Apply. */
    onApply: (xml: string) => void;
    /** Read-only host (disabled field, disabled form): the designer opens for viewing, Apply doesn't. */
    disabled?: boolean;
}

const useStyles = makeStyles({
    surface: {
        maxWidth: "95vw",
        width: "1200px",
    },
    body: {
        height: "78vh",
    },
    content: {
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
    },
});

/**
 * The form-facing shell: the column itself renders as a single icon button, and the whole designer
 * lives in a modal. Edits stay a local draft until Apply, so opening the designer and closing it
 * again never touches the bound column (and never dirties the form).
 */
export const FetchXmlField: React.FC<IFetchXmlFieldProps> = (props) => {
    const { onApply, disabled, ...designerProps } = props;
    const styles = useStyles();

    const [open, setOpen] = React.useState(false);

    // The draft is a ref, not state: it changes on every keystroke in the designer and only Apply
    // ever reads it, so re-rendering the shell for it would be pure waste.
    const draftRef = React.useRef(designerProps.initialXml);
    const [canApply, setCanApply] = React.useState(true);

    const handleDraftChange = React.useCallback((xml: string, applyAllowed: boolean) => {
        draftRef.current = xml;
        setCanApply(applyAllowed);
    }, []);

    const handleOpenChange = (isOpen: boolean): void => {
        if (isOpen) {
            // Re-arm from the committed value, so a cancelled draft is gone for good.
            draftRef.current = designerProps.initialXml;
            setCanApply(true);
        }
        setOpen(isOpen);
    };

    const handleApply = (): void => {
        onApply(draftRef.current);
        setOpen(false);
    };

    return (
        <IdPrefixProvider value={"fmdkfetchxml"}>
            <FluentProvider theme={webLightTheme}>
                <Tooltip content="Open the FetchXML designer" relationship="label">
                    <Button
                        appearance="subtle"
                        icon={<CodeIcon />}
                        aria-label="Open the FetchXML designer"
                        onClick={() => handleOpenChange(true)}
                    />
                </Tooltip>

                <Dialog open={open} onOpenChange={(_, data) => handleOpenChange(data.open)}>
                    <DialogSurface className={styles.surface}>
                        <DialogBody className={styles.body}>
                            <DialogTitle>FetchXML</DialogTitle>
                            <DialogContent className={styles.content}>
                                {/* Mounted only while open, so each open re-seeds the designer from the
                                    committed value and metadata calls don't run behind a closed dialog. */}
                                {open && <FetchXmlDesigner {...designerProps} onDraftChange={handleDraftChange} />}
                            </DialogContent>
                            <DialogActions>
                                <DialogTrigger disableButtonEnhancement>
                                    <Button appearance="secondary">Cancel</Button>
                                </DialogTrigger>
                                <Button appearance="primary" disabled={!canApply || disabled === true} onClick={handleApply}>
                                    Apply
                                </Button>
                            </DialogActions>
                        </DialogBody>
                    </DialogSurface>
                </Dialog>
            </FluentProvider>
        </IdPrefixProvider>
    );
};
