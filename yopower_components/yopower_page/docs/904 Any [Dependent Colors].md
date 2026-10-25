# Any (Dependent Colors)

- ✅ Any column type
- 📝 Enable **Editable** on the Column Definition and click the cell to enter edit mode
- ⚠️ Different of [700 Numbers & Date (Colors)](700%20Numbers%20&%20Date%20[Colors].md), the conditions can use **other columns** of the row to define the color of the cell.
- Rules work the same way as 700: first match wins, `group` defaults to `or`, `min` / `max` are inclusive, same `output` properties.

## column

Any column of the row, it should be included on the view! Supported values:

- Numbers, Currency and Duration: the value itself
- Option Sets: the option value (i.e. `628950000`)
- Two Options: `1` = yes, `0` = no
- Date Only / Date&Time: difference in minutes between the value and now

## criteria

- `range`: requires `min` and `max` (use the same value on both to match a single option)
- `is-null`
- `is-not-null`

## Parameters

```json
{
  "rules": [
    {
      "group": "and",
      "conditions": [
        {
          "column": "yp_optionset",
          "criteria": "range",
          "min": 628950000,
          "max": 628950000
        },
        {
          "column": "yp_decimal",
          "criteria": "is-null"
        }
      ],
      "output": {
        "background": "transparent",
        "color": "#666666"
      }
    },
    {
      "group": "and",
      "conditions": [
        {
          "column": "yp_optionset",
          "criteria": "range",
          "min": 628950001,
          "max": 628950001
        }
      ],
      "output": {
        "background": "#CCCCCC",
        "color": "#666666",
        "label": "Priority",
        "icon": "FavoriteStar"
      }
    },
    {
      "group": "and",
      "conditions": [
        {
          "column": "yp_optionset",
          "criteria": "range",
          "min": 628950002,
          "max": 628950002
        }
      ],
      "output": {
        "background": "#666666",
        "color": "#F1F1F1",
        "label": "Priority",
        "icon": "FavoriteStarFill"
      }
    }
  ]
}
```