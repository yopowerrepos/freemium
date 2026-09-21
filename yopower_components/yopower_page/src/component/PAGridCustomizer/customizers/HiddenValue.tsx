import * as React from "react";
import { ModifierState } from "../ControlKeyTracker";
import { CustomColumnDefinition } from "../models/common/CustomColumnDefinition";

// Customizer types that never mask their value with the CTRL double press toggle
// (901 is already read only, 801 and 702 are cell editors)
const excludedTypes: number[] = [901, 801, 702];

/**
 * Returns true when the definition opted in to the show / hide behaviour (showhide)
 * and the user currently toggled the masking on by pressing CTRL twice.
 */
export function isHidden(definition: CustomColumnDefinition, modifiers: ModifierState): boolean {
    return definition.showhide === true
        && modifiers.hideValues
        && !excludedTypes.includes(definition.type);
}

/**
 * Non interactive, read only replacement rendered instead of the customizer
 * while the masking is toggled on.
 */
export function getHiddenValue(): React.ReactElement {
    return <div
        aria-readonly={true}
        title=""
        style={{
            padding: "4px 8px",
            borderRadius: 2,
            textAlign: "center",
            lineHeight: "20px",
            display: "flex",
            justifyContent: "center",
            margin: "4px",
            letterSpacing: 2,
            userSelect: "none",
            pointerEvents: "none"
        }}
        onKeyDown={(e) => { e.preventDefault() }}
        onClick={(e) => { e.preventDefault() }}>
        ********
    </div>;
}
