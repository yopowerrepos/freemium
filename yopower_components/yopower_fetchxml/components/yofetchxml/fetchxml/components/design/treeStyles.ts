import { tokens } from "@fluentui/react-components";
import * as React from "react";

/** Bounds long option lists (attribute/relationship pickers) to a fixed height with internal scrolling. */
export const SCROLLABLE_LISTBOX = { style: { maxHeight: "280px", overflowY: "auto" as const } };

/** Left-accent bar marking an AND/OR filter group's nested conditions - same brand color at every depth, so a group's extent is always easy to trace by eye. */
export const FILTER_GROUP_BORDER_STYLE: React.CSSProperties = {
    borderLeft: `2px solid ${tokens.colorBrandStroke1}`,
};

/** Dashed-border boxed panel framing a link entity - shared by the Filter tab and Columns tab so a join reads the same way in either one. */
export const LINK_ENTITY_BOX_STYLE: React.CSSProperties = {
    border: `1px dashed ${tokens.colorBrandStroke1}`,
    borderRadius: "4px",
    padding: "8px 10px",
};

/** Shared compact look for Input/Combobox/Dropdown/SpinButton: 24px tall, underline-only border. */
export const COMPACT_FIELD_PROPS = {
    size: "small" as const,
    appearance: "underline" as const,
};

/**
 * Same compact look as COMPACT_FIELD_PROPS, for popup-bearing controls (Combobox/Dropdown) only.
 * Fluent defaults their popup to the trigger's own width, which clips long option labels when the
 * trigger is narrow - this opts out of that so the popup instead sizes to its content.
 */
export const POPUP_FIELD_PROPS = {
    size: "small" as const,
    appearance: "underline" as const,
    positioning: { matchTargetSize: undefined },
};

export const COMPACT_HEIGHT_STYLE = { maxHeight: "24px" };
