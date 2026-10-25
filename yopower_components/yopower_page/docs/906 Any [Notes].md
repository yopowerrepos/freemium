# Any (Notes)

- ✅ Any column type
- Displays the notes related to the row, to a lookup of the row, or to a custom fetchxml to group them.
- ⚠️ The `reference` property defines whether the `row` or a `column` (lookup on the view) is used to substitute the placeholders `#value#` and `#valuetype#`.

## Parameters

| **Property**        | **Required** | **Description**                                                                                                           |
| ------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `popUpLastModified` | Yes          | `true` shows the last modified note directly on the cell, `false` shows the notes count                                   |
| `reference`         | Yes          | `row` or `column`                                                                                                         |
| `column`            | Yes          | Lookup column used when `reference` is `column`, use `""` with `row`                                                       |
| `fetchXmlAggregate` | Yes          | Custom count query, `""` = notes of the reference                                                                          |
| `fetchXml`          | Yes          | Custom notes query, `""` = notes of the reference ordered by `modifiedon` descending                                       |

When the queries are customized:

- Both should point to the `annotation` table.
- `fetchXmlAggregate` must include `<attribute name='annotationid' aggregate='count' alias='count' />`.
- `fetchXml` must include the attributes `annotationid`, `subject`, `notetext`, `createdon`, `createdby`, `modifiedon`, `modifiedby`, `isdocument` and `filename`. Add `<order attribute='modifiedon' descending='true' />` when using `popUpLastModified`.

## Parameters - Notes related to the row

```json
{
  "popUpLastModified": true,
  "reference": "row",
  "column": "",
  "fetchXmlAggregate": "",
  "fetchXml": ""
}
```

## Parameters - Notes related to the column lookup (Account)

```json
{
  "popUpLastModified": false,
  "reference": "column",
  "column": "yp_accountid",
  "fetchXmlAggregate": "",
  "fetchXml": ""
}
```

## Parameters - Notes of the Contacts related to the column lookup (Account)

```json
{
  "popUpLastModified": false,
  "reference": "column",
  "column": "yp_accountid",
  "fetchXmlAggregate": "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' aggregate='true'><entity name='annotation'><attribute name='annotationid' aggregate='count' alias='count' /><link-entity name='contact' from='contactid' to='objectid' link-type='inner' alias='contact'><filter type='and'><condition attribute='parentcustomerid' operator='eq' uitype='#valuetype#' value='#value#' /></filter></link-entity></entity></fetch>",
  "fetchXml": "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'><entity name='annotation'><attribute name='annotationid' /><attribute name='subject' /><attribute name='notetext' /><attribute name='createdon' /><attribute name='createdby' /><attribute name='modifiedon' /><attribute name='modifiedby' /><attribute name='isdocument' /><attribute name='filename' /><order attribute='modifiedon' descending='true' /><link-entity name='contact' from='contactid' to='objectid' link-type='inner' alias='contact'><filter type='and'><condition attribute='parentcustomerid' operator='eq' uitype='#valuetype#' value='#value#' /></filter></link-entity></entity></fetch>"
}
```
