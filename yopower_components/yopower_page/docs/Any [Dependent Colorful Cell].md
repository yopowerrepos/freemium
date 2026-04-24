# Any [Dependent Colorful Cell]

- 📝 Use double click to enter on edit mode
- ⚠️ Different of 'Numbers & Date [Colorful Cell]' it will define a color according the column defined on parameters
- Criteria is an optional parameter can be set 'is-null', 'not-null' or 'range'.
- If there is not criteria it will assume 'range'

## Parameters

```json
{
  "column": "yp_optionset",
  "rules": [
    {
      "criteria": "is-null",
      "background": "#666666",
      "color": "#F1F1F1"
    },
    {
      "min": 628950000,
      "max": 628950000,
      "background": "#A1D6A5",
      "color": "#666666"
    },
    {
      "min": 628950001,
      "max": 628950001,
      "background": "#FAD897",
      "color": "#666666"
    },
    {
      "min": 628950002,
      "max": 628950002,
      "background": "#E098AF",
      "color": "#FFFFFF"
    }
  ]
}
```