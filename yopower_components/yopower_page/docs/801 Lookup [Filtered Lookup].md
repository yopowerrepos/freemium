# Lookup (Filtered Lookup)

- ✅ Lookup, Customer and Owner
- 📝 Works on edit mode only, enable **Editable** on the Column Definition
- Filters the lookup dialog with a custom fetchxml `filter`, using the row or another lookup column of the row as reference.

## Parameters

| **Property** | **Required** | **Description**                                                                                                                       |
| ------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `reference`  | Yes          | `row` (the current record) or `column` (the lookup informed on `column`). Case-sensitive, any other value disables the filter        |
| `column`     | Yes          | Lookup column of the row used when `reference` is `column`, it must be on the view. Use `""` with `row`                                |
| `viewId`     | Yes          | View used by the lookup dialog, `00000000-0000-0000-0000-000000000000` keeps the default view                                          |
| `filter`     | Yes          | fetchxml `<filter>` applied on the lookup                                                                                             |

### Placeholders

| **Placeholder** | **Replaced by**                                                         |
| --------------- | ----------------------------------------------------------------------- |
| `#value#`       | Id of the reference (row id or the lookup value id)                     |
| `#valuetype#`   | Table logical name of the reference, used on the `uitype` attribute     |

⚠️ Each placeholder is replaced only once, use them a single time on the filter.

## Parameters - Contacts of the account informed on the row

```json
{
  "reference": "column",
  "column": "yp_accountid",
  "viewId": "00000000-0000-0000-0000-000000000000",
  "filter": "<filter type='and'><condition attribute='parentcustomerid' operator='eq' uitype='#valuetype#' value='#value#'/></filter>"
}
```

## Parameters - Records related to the row

```json
{
  "reference": "row",
  "column": "",
  "viewId": "00000000-0000-0000-0000-000000000000",
  "filter": "<filter type='and'><condition attribute='parentaccountid' operator='eq' uitype='#valuetype#' value='#value#'/></filter>"
}
```
