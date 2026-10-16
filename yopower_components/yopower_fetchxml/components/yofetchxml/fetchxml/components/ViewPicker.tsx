import * as React from "react";
import { Combobox, Option, OptionGroup, Spinner, Text } from "@fluentui/react-components";
import { IViewOption, ViewKind } from "../services/metadataService";
import { SCROLLABLE_LISTBOX, POPUP_FIELD_PROPS, COMPACT_HEIGHT_STYLE } from "./design/treeStyles";
import { useComboboxFilter } from "./design/useComboboxFilter";

export interface IViewPickerProps {
    entityName: string;
    getViews: (entityName: string) => Promise<IViewOption[]>;
    /** Replaces the whole query with the view's FetchXML; returns the parse error, if any. */
    onLoad: (fetchXml: string) => { success: boolean; error?: string };
}

const VIEW_GROUPS: { kind: ViewKind; label: string }[] = [
    { kind: "system", label: "System views" },
    { kind: "personal", label: "My views" },
];

/** Seeds the designer from an existing system or personal view of the current entity, as a reference to build on. */
export const ViewPicker: React.FC<IViewPickerProps> = ({ entityName, getViews, onLoad }) => {
    const [views, setViews] = React.useState<IViewOption[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | undefined>(undefined);
    const [selectedId, setSelectedId] = React.useState<string | undefined>(undefined);

    React.useEffect(() => {
        let cancelled = false;
        setViews([]);
        setError(undefined);
        if (!entityName) return undefined;
        setLoading(true);
        getViews(entityName)
            .then((result) => {
                if (!cancelled) {
                    setViews(result);
                    setLoading(false);
                }
                return undefined;
            })
            .catch((e: Error) => {
                if (!cancelled) {
                    setError(e?.message ?? "Failed to load views");
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [entityName, getViews]);

    const selectedName = views.find((v) => v.id === selectedId)?.name ?? "";
    const viewFilter = useComboboxFilter(views, (v) => v.name, selectedName);

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Combobox
                {...POPUP_FIELD_PROPS}
                disabled={!entityName}
                placeholder={!entityName ? "Pick an entity to load its views" : loading ? "Loading views..." : "Start from a view..."}
                value={viewFilter.inputValue}
                selectedOptions={selectedId ? [selectedId] : []}
                onChange={(e) => viewFilter.onInputChange((e.target as HTMLInputElement).value)}
                onOptionSelect={(_, data) => {
                    viewFilter.endSearch();
                    const view = views.find((v) => v.id === data.optionValue);
                    if (!view) return;
                    const result = onLoad(view.fetchXml);
                    setError(result.success ? undefined : `Could not load "${view.name}": ${result.error ?? "invalid FetchXML"}`);
                    setSelectedId(result.success ? view.id : undefined);
                }}
                onBlur={() => viewFilter.endSearch()}
                listbox={SCROLLABLE_LISTBOX}
                style={{ minWidth: "260px", ...COMPACT_HEIGHT_STYLE }}
            >
                {!loading && views.length === 0 && (
                    <Option key="__none" value="" disabled>
                        No views found
                    </Option>
                )}
                {VIEW_GROUPS.map((group) => {
                    const items = viewFilter.filteredItems.filter((v) => v.kind === group.kind);
                    if (items.length === 0) return null;
                    return (
                        <OptionGroup key={group.kind} label={group.label}>
                            {items.map((v) => (
                                <Option key={v.id} value={v.id} text={v.name}>
                                    {v.name}
                                </Option>
                            ))}
                        </OptionGroup>
                    );
                })}
            </Combobox>
            {loading && <Spinner size="tiny" />}
            {error && (
                <Text size={200} style={{ color: "var(--colorPaletteRedForeground1)" }}>
                    {error}
                </Text>
            )}
        </div>
    );
};
