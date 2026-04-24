import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { FluentProvider, IdPrefixProvider, webLightTheme, PopoverTrigger, PopoverSurface, Popover, Button, Toolbar, ToolbarButton, Divider } from "@fluentui/react-components";
import { Icon } from "@fluentui/react";
import { IInputs } from "../generated/ManifestTypes";
import { Helper } from "../helper";

export const RichTextPopoverComponent: React.FC<ICell> = (cell) => {
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [content, setContent] = React.useState<string>(cell.props.value || "");
    const [hasChanges, setHasChanges] = React.useState(false);
    const editorRef = React.useRef<HTMLDivElement>(null);
    const baselineRef = React.useRef<string>("");

    const isEditable = cell.definition?.settings?.editable;

    const handleOpenChange = (_: any, data: { open: boolean }) => {
        if (!data.open) { setContent(cell.props.value || ""); setHasChanges(false); }
        setIsPopoverOpen(data.open);
    };

    const handleCancel = () => {
        setContent(cell.props.value || "");
        setHasChanges(false);
        setIsPopoverOpen(false);
    };

    const handleSaveClick = async () => {
        if (!editorRef.current) return;
        const newValue = editorRef.current.innerHTML;
        const success = await Helper.saveRichText(cell.context, cell.table, cell.id, cell.col.name, newValue);
        if (success) {
            setContent(newValue);
            setHasChanges(false);
            setIsPopoverOpen(false);
        }
    };

    const handleInput = () => {
        if (editorRef.current)
            setHasChanges(editorRef.current.innerHTML !== baselineRef.current);
    };

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    };

    React.useEffect(() => {
        if (isPopoverOpen && isEditable && editorRef.current) {
            editorRef.current.innerHTML = content;
            baselineRef.current = editorRef.current.innerHTML;
            setHasChanges(false);
            editorRef.current.focus();
        }
    }, [isPopoverOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation();
        if (e.key === "Escape") { e.preventDefault(); handleCancel(); }
        if (e.key === "Enter" && e.ctrlKey) { e.preventDefault(); handleSaveClick(); }
    };

    if (!cell.props.value) return null;

    return (
        <div
            style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                paddingLeft: "5px"
            }}
        >
            <IdPrefixProvider value={cell.table + cell.id + cell.col.colId}>
                <FluentProvider theme={webLightTheme}>
                    <Popover withArrow open={isPopoverOpen} onOpenChange={handleOpenChange}>
                        <PopoverTrigger disableButtonEnhancement>
                            <div style={{ background: "transparent", width: 0 }}>
                                {new DOMParser().parseFromString(cell.props.value, "text/html").body.textContent}
                            </div>
                        </PopoverTrigger>
                        <PopoverSurface tabIndex={-1}>
                            <div style={{ display: "flex", flexDirection: "column", minWidth: "300px", maxWidth: "500px" }}>
                                {isEditable && (
                                    <div style={{ display: "flex", alignItems: "center", padding: "4px 8px", borderBottom: "1px solid #e0e0e0", backgroundColor: "#fafafa" }}>
                                        <Toolbar size="small">
                                            <ToolbarButton icon={<Icon iconName="Bold" style={{ fontSize: 14 }} />} title="Bold (Ctrl+B)" onClick={() => execCommand("bold")} />
                                            <ToolbarButton icon={<Icon iconName="Italic" style={{ fontSize: 14 }} />} title="Italic (Ctrl+I)" onClick={() => execCommand("italic")} />
                                            <ToolbarButton icon={<Icon iconName="Underline" style={{ fontSize: 14 }} />} title="Underline (Ctrl+U)" onClick={() => execCommand("underline")} />
                                            <ToolbarButton icon={<Icon iconName="Strikethrough" style={{ fontSize: 14 }} />} title="Strikethrough" onClick={() => execCommand("strikeThrough")} />
                                            <Divider vertical style={{ height: 20, margin: "0 4px" }} />
                                            <ToolbarButton icon={<Icon iconName="BulletedList" style={{ fontSize: 14 }} />} title="Bulleted List" onClick={() => execCommand("insertUnorderedList")} />
                                            <ToolbarButton icon={<Icon iconName="NumberedList" style={{ fontSize: 14 }} />} title="Numbered List" onClick={() => execCommand("insertOrderedList")} />
                                            <Divider vertical style={{ height: 20, margin: "0 4px" }} />
                                            <ToolbarButton icon={<Icon iconName="RemoveFormat" style={{ fontSize: 14 }} />} title="Clear Formatting" onClick={() => execCommand("removeFormat")} />
                                        </Toolbar>
                                    </div>
                                )}
                                {isEditable ? (
                                    <div
                                        ref={editorRef}
                                        contentEditable
                                        onKeyDown={handleKeyDown}
                                        onInput={handleInput}
                                        style={{ minHeight: "120px", maxHeight: "300px", overflowY: "auto", padding: "12px", outline: "none", fontSize: "14px", lineHeight: "1.5" }}
                                    />
                                ) : (
                                    <div
                                        style={{ minHeight: "120px", maxHeight: "300px", overflowY: "auto", padding: "12px", fontSize: "14px", lineHeight: "1.5" }}
                                        dangerouslySetInnerHTML={{ __html: cell.props.value }}
                                    />
                                )}
                                {isEditable && hasChanges && (
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", padding: "8px 12px", borderTop: "1px solid #e0e0e0", backgroundColor: "#fafafa" }}>
                                        <Button appearance="secondary" size="small" icon={<Icon iconName="Cancel" />} onClick={handleCancel}>Cancel</Button>
                                        <Button appearance="primary" size="small" icon={<Icon iconName="Save" />} onClick={handleSaveClick}>Save</Button>
                                    </div>
                                )}
                            </div>
                        </PopoverSurface>
                    </Popover>
                </FluentProvider>
            </IdPrefixProvider>
        </div>
    );
};
