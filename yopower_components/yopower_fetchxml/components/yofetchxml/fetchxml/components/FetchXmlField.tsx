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
    mergeClasses,
} from "@fluentui/react-components";
import { FetchXmlDesigner, IFetchXmlDesignerProps, DesignerView } from "./FetchXmlDesigner";
import { compactTheme } from "./compactTheme";

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

export interface IFetchXmlFieldProps extends Omit<IFetchXmlDesignerProps, "onDraftChange" | "view" | "runToken"> {
    /** Commits the draft to the bound column. Only ever called from Apply. */
    onApply: (xml: string) => void;
    /** Read-only host (disabled field, disabled form): the designer opens for viewing, Apply doesn't. */
    disabled?: boolean;
}

const useStyles = makeStyles({
    // Near full-screen: the designer shows editor, XML and test results side by side.
    surface: {
        width: "calc(100vw - 32px)",
        maxWidth: "calc(100vw - 32px)",
        height: "calc(100vh - 32px)",
        maxHeight: "calc(100vh - 32px)",
        boxSizing: "border-box",
        padding: "12px 16px",
    },
    body: {
        height: "100%",
        maxHeight: "100%",
        gap: "6px",
    },
    content: {
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
    },
    suspended: {
        visibility: "hidden",
    },
});

/**
 * The form-facing shell: the column itself renders as a single icon button, and the whole designer
 * lives in a modal. Edits stay a local draft until Apply, so opening the designer and closing it
 * again never touches the bound column (and never dirties the form).
 */
export const FetchXmlField: React.FC<IFetchXmlFieldProps> = (props) => {
    const { onApply, disabled, pickLookup, openRecord, ...designerProps } = props;
    const styles = useStyles();

    const [open, setOpen] = React.useState(false);
    const [view, setView] = React.useState<DesignerView>("design");
    const [runToken, setRunToken] = React.useState(0);

    // Platform dialogs (lookup picker, navigateTo record form) render in the host page, beneath
    // Fluent's portal, and the modal dialog's focus trap would block typing into them anyway. While
    // one is open the designer is hidden and made non-modal - kept mounted, so no edits are lost -
    // and comes back once the platform dialog resolves. A counter, in case two ever overlap.
    const [platformDialogCount, setPlatformDialogCount] = React.useState(0);
    const suspended = platformDialogCount > 0;

    const withPlatformDialog = React.useCallback(async <T,>(run: () => Promise<T>): Promise<T> => {
        setPlatformDialogCount((c) => c + 1);
        try {
            return await run();
        } finally {
            setPlatformDialogCount((c) => c - 1);
        }
    }, []);

    const pickLookupAbove = React.useCallback<IFetchXmlFieldProps["pickLookup"]>(
        (entityTypes, allowMultiSelect) => withPlatformDialog(() => pickLookup(entityTypes, allowMultiSelect)),
        [pickLookup, withPlatformDialog]
    );
    const openRecordAbove = React.useCallback<IFetchXmlFieldProps["openRecord"]>(
        (entityName, id) => withPlatformDialog(() => openRecord(entityName, id)),
        [openRecord, withPlatformDialog]
    );

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
            setView("design");
            setRunToken(0);
        }
        setOpen(isOpen);
    };

    const handleApply = (): void => {
        onApply(draftRef.current);
        setOpen(false);
    };

    return (
        <IdPrefixProvider value={"fmdkfetchxml"}>
            <FluentProvider theme={compactTheme}>
                <Tooltip content="Open the FetchXML designer" relationship="label">
                    <Button
                        appearance="subtle"
                        icon={<CodeIcon />}
                        aria-label="Open the FetchXML designer"
                        onClick={() => handleOpenChange(true)}
                    />
                </Tooltip>

                <Dialog open={open} modalType={suspended ? "non-modal" : "modal"} onOpenChange={(_, data) => handleOpenChange(data.open)}>
                    <DialogSurface className={mergeClasses(styles.surface, suspended && styles.suspended)}>
                        <DialogBody className={styles.body}>
                            <DialogTitle>FetchXML</DialogTitle>
                            <DialogContent className={styles.content}>
                                {/* Mounted only while open, so each open re-seeds the designer from the
                                    committed value and metadata calls don't run behind a closed dialog. */}
                                {open && (
                                    <FetchXmlDesigner
                                        {...designerProps}
                                        pickLookup={pickLookupAbove}
                                        openRecord={openRecordAbove}
                                        onDraftChange={handleDraftChange}
                                        view={view}
                                        runToken={runToken}
                                    />
                                )}
                            </DialogContent>
                            <DialogActions position="start">
                                {view === "design" ? (
                                    <Button
                                        appearance="secondary"
                                        onClick={() => {
                                            setView("test");
                                            setRunToken((t) => t + 1);
                                        }}
                                    >
                                        Run Test
                                    </Button>
                                ) : (
                                    <Button appearance="secondary" onClick={() => setView("design")}>
                                        ◂ Back to designer
                                    </Button>
                                )}
                            </DialogActions>
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
