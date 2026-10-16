# Changelog

All notable changes to the **fetchxml** PCF control (`yopower.fetchxml`).

## 0.0.44 - 2026-10-16

**In this release**

- [Bug fixes](#bug-fixes) - table picker empty without `allowedEntities`; lookup picker and record forms opening behind the designer
- [UX](#ux) - new layout; `In` / `Not In` conditions; results grid
- [Features](#features) - Convert to SQL; AI Explain using AI Builder; start from a view; conditions on link-entity columns
- [Upgrade notes](#upgrade-notes)

### Bug fixes

#### Tables didn't load when no specific tables were configured

When `allowedEntities` wasn't set, the **Entity** picker stayed empty. Loading every table called the metadata endpoint with `$orderby`, which metadata endpoints reject (HTTP 400), and the error was swallowed. The list is now sorted client-side, so every table valid for Advanced Find shows up again.

#### Lookup picker and record forms opened behind the designer (z-index)

The platform's lookup dialog and `navigateTo` record forms render in the host page, beneath the designer's dialog, whose focus trap also blocked typing into them. While a platform dialog is open, the designer is now hidden and made non-modal - kept mounted, so no edits are lost - and comes back when the platform dialog closes.

### UX

#### Layout

- The designer opens near full-screen, with the editor (Columns / Filter) and the live XML side by side (60/40).
- **Run Test** moved to the dialog footer and switches the whole area to the results; **Back to designer** returns to the editor.
- Both views stay mounted, so switching keeps unsaved XML, placeholder values, impersonation and the last results.
- A compact Fluent theme steps the type ramp down one notch (through theme tokens instead of CSS overrides), so popups and dialogs scale consistently.

#### `In` / `Not In`

- Multi-value conditions list one value per line, growing downwards instead of pushing the row sideways.
- Lookup values use the multi-select lookup dialog. Picked records fill empty slots first, and duplicates are skipped.
- Clearing a lookup chip removes that entry instead of leaving a blank row.

#### Results grid

- Lookups and primary key columns (including those from link-entities) are recognised and can be opened as records.

### Features

#### Convert to SQL

A new **SQL** button in the toolbar shows the current query translated to T-SQL by Dataverse's `FetchXMLToSQL` function, in a dialog with a **Copy** button. The *Subquery compatible* option switches between the two output styles the function supports. Useful for reviewing what a query really does, or for reusing its logic in reporting/SQL tooling.

#### AI Explain using AI Builder

A new **Explain** button sends the query to an AI Builder prompt (*FetchXml to End-User Translator*, shipped in the solution) and shows a plain-language explanation aimed at non-technical users, with the token usage and AI Builder credits consumed.

- **Save** writes the explanation to a new, optional bound column, `explaining`. It's written straight away, independent of **Apply**.
- On the next open, the saved explanation is shown instead of calling the AI again, so credits are only spent on an explicit **Refresh**. If the query has changed since the explanation was generated, a banner says so.
- On a read-only form, explanations can be viewed and refreshed, but not saved.

#### Start from a view

A view picker next to the entity seeds the designer from any active system or personal view of the root entity (associated, quick find and lookup views are left out).

#### Conditions on link-entity columns

A condition on the root filter can target a joined table by its alias (`entityname="alias"`); its field list, operators and value pickers follow the aliased table.

### Upgrade notes

- **AI Explain:** to keep explanations, add a Multiple Lines of Text column to the table and bind it to the control's new **Explaining** property. Leaving it unbound is fine - Explain still works, it just can't save.
- **AI Builder capacity:** each explanation consumes AI Builder credits, so the environment needs AI Builder capacity and users need permission to run the prompt.
- No existing configuration property changed: `allowedEntities`, `requiredAttributes`, `requiredAlias` and `placeholders` carry over as-is.

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
