# Lookup (Filtered Lookup)

- ✅ Lookups and Customers
- ⚠️ The `reference` property defines whether the row or a column is used to substitute the placeholder `#value#`.

## Parameters

```json
{
  "reference": "column/row",
  "column": "yp_accountid",
  "viewId": "00000000-0000-0000-0000-000000000000",
  "filter": "<filter type='and'><condition attribute='parentcustomerid' operator='eq' uitype='#valuetype#' value='#value#'/></filter>"
}
```
