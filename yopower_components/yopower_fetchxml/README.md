# FetchXml as Settings

A Power Apps component framework (PCF) field control that turns a plain text column into a visual FetchXML designer on a model-driven app form. The column renders as a single button; the designer opens in a dialog, where you build columns, filters and joins from metadata-driven pickers, review/edit the raw XML, and test-run the query (as yourself or as someone else) before applying it.

## Installing / configuring

### Prerequisites

- Node.js and npm
- [Power Platform CLI](https://learn.microsoft.com/power-platform/developer/cli/introduction) (`pac`), authenticated to the target environment

### Build

```bash
npm install
npm run build      # or: npm run rebuild for a clean build
```

Output is written to `./out/controls/fetchxml` (see `pcfconfig.json`).

### Deploy

The fastest path for iterating in a dev environment is `pac pcf push`, which packages the control and imports it straight into a solution without a separate build/import step:

```bash
pac auth select -n <your-auth-profile>
pac pcf push --solution-unique-name fetchassettings
```

### Add it to a form

The control binds to a **Multiple Lines of Text** column (that's the FetchXML property itself). In the form designer:

1. Add/select the text column, add a component, and pick **fetchxml**.
2. Set the optional input properties described below as needed.
3. Publish.

The control renders as a single button, so a field row sized for a full-height control will leave a large gap underneath it - shrink the row while you're in the form designer.

## Using the designer

On the form the column shows a code icon button. Click it and the designer opens in a dialog:

- **Apply** writes the query to the column and closes the dialog. It's the only thing that ever changes the column value - the form itself still has to be saved afterwards.
- **Cancel**, Esc, or clicking outside the dialog discards everything done since it was opened; the column keeps its previous value.
- On a read-only form or a locked field the designer still opens, so a query can be reviewed and test-run, but **Apply** is disabled.

## Configuration properties

| Property             | Type                          | Required | Purpose                                                         |
| -------------------- | ----------------------------- | -------- | --------------------------------------------------------------- |
| `allowedEntities`    | Single line of text           | No       | Restricts which entities can be picked as the **root** entity   |
| `requiredAttributes` | Multiple lines of text (JSON) | No       | Attributes/columns that must always be present                  |
| `requiredAlias`      | Multiple lines of text (JSON) | No       | Output aliases that must be present and bound to an allowed type |
| `placeholders`       | Multiple lines of text (JSON) | No       | Named tokens usable in filter values, resolved at test/run time |

Misconfigured `requiredAttributes`/`requiredAlias`/`placeholders` JSON doesn't break the control - it shows a warning banner above the tabs in the designer and simply treats the setting as empty.

### `allowedEntities`

Comma-separated list of entity logical names, e.g.:

```
account,contact,opportunity
```

This narrows the autocomplete list on the Columns tab's **Entity** picker. Note it's a UX convenience, not a hard lock: that field is freeform, so a value can still be typed in manually. Use security roles / a server-side check if you need a real enforcement boundary.

### `requiredAttributes`

A JSON array describing columns that must always be selected whenever their entity is present in the query:

```json
[
  { "attribute": "statecode" },
  { "entity": "account", "attribute": "name", "alias": "ac.name" }
]
```

- **attribute** (required) - logical name of the column.
- **entity** (optional) - the entity it applies to. Omit it to target the **root** entity only; set it to a related entity's logical name to target that join instead.
- **alias** (optional) - forces an output alias on the column (`<attribute name="name" alias="ac.name" />`).

Matching attributes are auto-added to the Columns tab and shown with a red `*` instead of a remove button - the maker can't take them out. This only fills in columns on entities/joins already in the query; it never adds a join just to satisfy a required attribute.

### `requiredAlias`

A JSON array validating that a given **output alias** (`<attribute name="..." alias="..." />`) is present somewhere in the query - root entity or any link entity - and bound to an attribute of an allowed type:

```json
[
  { "alias": "id", "binding": ["id", "string", "decimal", "integer", "long", "float", "double", "boolean", "lookup"] },
  { "alias": "label", "binding": ["string"] }
]
```

- **alias** (required) - the output alias to look for, anywhere in the query.
- **binding** (required) - one or more of `id`, `string`, `decimal`, `integer`, `long`, `float`, `double`, `boolean`, `lookup`. The attribute's resolved Dataverse type must be one of these (`float` has no live Dataverse equivalent, so it never actually matches - it's accepted for forward compatibility only).

Unlike `requiredAttributes`, this doesn't add anything to the query or lock any UI control - it only resolves live attribute metadata for whatever's already there and shows a warning banner listing aliases that are missing entirely, or present but bound to a disallowed type. It never blocks **Apply**.

### `placeholders`

A JSON array of reusable named tokens (`{{name}}`) that can be dropped into a filter condition's value instead of a literal, and are later substituted with real values on the Test tab:

```json
[
  { "name": "anchorid", "type": "guid" },
  { "name": "industry", "type": "optionset", "entityName": "account", "attributeName": "industrycode" },
  { "name": "ownerId", "type": "lookup", "entityName": "systemuser", "required": true }
]
```

- **name** (required) - the token name, referenced in the query as `{{name}}`.
- **type** (required) - one of `guid`, `lookup`, `optionset`, `decimal`, `string`, `boolean`, `datetime`. Drives which input shows up on the Test tab (date picker, True/False dropdown, an optionset dropdown sourced from real choices, a lookup picker, etc.).
- **entityName** / **attributeName** (optional) - context Dataverse needs to render the right test-value widget:
  - `lookup` uses **entityName** as the entity to search.
  - `optionset` uses **entityName** + **attributeName** to pull the real list of choices.
  - When either is set, they also **restrict where the placeholder can be picked** on the Filter tab - only on a condition against that exact entity/attribute. Leave both out to allow it on any condition.
- **required** (optional, default `false`) - when `true`, the placeholder must actually be used by a condition somewhere in the query. If it isn't, the designer shows an error banner and **Apply** stays disabled, so the query can't be written to the column in that state.

The token itself (`{{name}}`) stays in the saved FetchXML - it's resolved only when the query actually runs (on the Test tab here, or by whatever consumes the saved FetchXML at runtime).

## Test tab

The Test tab, inside the designer dialog, runs the current query for real against Dataverse - on the draft you're editing, whether or not it's been applied yet.

- **Placeholder values** - any placeholders used by the query get an input here; these values are only used for this test run and aren't saved with the query.
- **Run as another user (impersonate)** - pick a user via the standard lookup dialog and the query re-runs *as them*, so you can check what records they'd actually see under their security roles/team access without signing in as them.
- **Show formatted values** - toggles the results grid between raw stored values (guids, optionset codes) and Dataverse's formatted display values (lookup/optionset labels, localized numbers and dates).
- **Resolved FetchXML** - shows the exact XML sent to the server after placeholder substitution.