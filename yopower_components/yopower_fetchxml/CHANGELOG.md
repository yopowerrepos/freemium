# Changelog

All notable changes to the **fetchxml** PCF control (`yopower.fetchxml`).

## 0.0.31 - 2026-09-21

### Changed

**The designer now opens in a dialog instead of sitting inline on the form.**

The bound column renders as a single code icon button. Clicking it opens the full designer - Columns, Filter, XML and Test, unchanged - in a modal over the form.

- **Edits are a draft until you hit Apply.** Apply writes the query to the column and closes the dialog; Cancel, Esc and clicking outside all discard. Opening the designer and closing it again no longer touches the column or dirties the form.
- **Apply is disabled while a required placeholder is unused.** Previously the control just silently stopped writing the value, with no indication why. The error banner still explains which placeholders are missing.
- **Read-only forms and locked fields** open the designer for viewing, with Apply disabled.

> **Upgrade note:** the control now takes up one button's worth of space. Form rows sized for the old inline designer will leave a large gap - shrink them in the form designer and republish. No configuration property changed, so `allowedEntities`, `requiredAttributes`, `requiredAlias` and `placeholders` carry over as-is.

### Fixed

**The designer opened blank on form load; the saved query only appeared after a browser refresh.**

The control read the bound column once during `init()`, where the platform has usually not delivered the record data yet, so it started from an empty value - and the designer seeds its state only on mount, so the real query arriving moments later was ignored. The control now watches the bound value and re-seeds the designer when the platform delivers it.

**A saved query could be silently overwritten with an empty one.** While showing that blank state, the control wrote an empty `<fetch>` back to the column and marked the field dirty. Saving the form in that state replaced the stored query. Nothing writes to the column now except an explicit Apply.

### Internal

- New `FetchXmlField` shell owns the button, the dialog and the Fluent providers; `FetchXmlDesigner` reports a draft upward (`onDraftChange`) rather than committing.
- The Code glyph is inlined as SVG rather than imported from `@fluentui/react-icons`: that package resolves to a `@griffel/react` build requiring `react/jsx-runtime`, which the React 16.14 platform library does not ship.
