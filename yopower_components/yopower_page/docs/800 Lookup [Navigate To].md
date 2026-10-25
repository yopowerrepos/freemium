# Lookup (Navigate To)

- ✅ Lookup, Customer and Owner
- 📝 Enable **Editable** on the Column Definition to change the lookup value
- Adds buttons to open the record referenced by the lookup on a modal (`modal`) or on a side pane (`sidePane`), same structure of [900 Any (Navigate To)](900%20Any%20[Navigate%20To].md).
- `modal` and `sidePane` are both required, use `[]` to skip one of them.

## Parameters

```json
{
  "modal": [
    {
      "position": 1,
      "label": "⬆️Center Modal",
      "formId": "00000000-0000-0000-0000-000000000000",
      "tabName": "tab_name",
      "height": {
        "value": 80,
        "unit": "%"
      },
      "width": {
        "value": 70,
        "unit": "%"
      }
    },
    {
      "position": 2,
      "label": "↗️Right Modal",
      "formId": "00000000-0000-0000-0000-000000000000",
      "tabName": "tab_name",
      "height": {
        "value": 80,
        "unit": "%"
      },
      "width": {
        "value": 70,
        "unit": "%"
      }
    }
  ],
  "sidePane": []
}
```