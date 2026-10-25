# Numbers (Progress Bar)

- ✅ Integer, Decimal and Float
- 📝 Enable **Editable** on the Column Definition and click the cell to enter edit mode
- ⚠️ The progress bar expects a value between **0 and 1**, use `type` to convert the column value:

| **type** | **Conversion**     | **Use when**                                |
| -------- | ------------------ | ------------------------------------------- |
| `""`     | none               | the column already stores 0 ~ 1 (i.e. 0.75) |
| `"/"`    | column value / 100 | the column stores 0 ~ 100 (i.e. 75)         |
| `"*"`    | column value × 100 | the column stores 0 ~ 0.01                  |

- The conversion is applied only to draw the bar, rules are always evaluated against the original column value.
- Rules work the same way as [700 Numbers & Date (Colors)](700%20Numbers%20&%20Date%20[Colors].md#how-rules-are-evaluated): first match wins, `group` defaults to `or`, `min` / `max` are inclusive, and every condition `column` must be the `yp_subgrid_column`.
- `output.background` is the bar and icon color, `output.color` is the text color and `output.label` is the tooltip.
- If no rule matches, no progress bar is rendered.

## criteria

- `range`: requires `min` and `max`
- `is-null`
- `is-not-null`

## Parameters Decimal (0 ~ 1)

```json
{
  "type": "",
  "rules": [
    {
      "group": "and",
      "conditions": [
        {
          "column": "yp_decimal",
          "criteria": "is-null"
        }
      ],
      "output": {
        "background": "transparent",
        "color": "#666666",
        "label": "Fill out value",
        "icon": "StatusCircleQuestionMark"
      }
    },
    {
      "group": "and",
      "conditions": [
        {
          "column": "yp_decimal",
          "criteria": "range",
          "min": 0,
          "max": 0.25
        }
      ],
      "output": {
        "icon": "DislikeSolid",
        "background": "#E098AF",
        "color": "#1F1F1F",
        "label": "0 ~ 25"
      }
    },
    {
      "group": "and",
      "conditions": [
        {
          "column": "yp_decimal",
          "criteria": "range",
          "min": 0.25,
          "max": 0.50
        }
      ],
      "output": {
        "icon": "Warning",
        "background": "#F4B394",
        "color": "#1F1F1F",
        "label": "26 ~ 50"
      }
    },
    {
      "group": "and",
      "conditions": [
        {
          "column": "yp_decimal",
          "criteria": "range",
          "min": 0.50,
          "max": 0.75
        }
      ],
      "output": {
        "icon": "LikeSolid",
        "background": "#FAD897",
        "color": "#1F1F1F",
        "label": "51 ~ 75"
      }
    },
    {
      "group": "and",
      "conditions": [
        {
          "column": "yp_decimal",
          "criteria": "range",
          "min": 0.75,
          "max": 1
        }
      ],
      "output": {
        "icon": "LikeSolid",
        "background": "#A1D6A5",
        "color": "#1F1F1F",
        "label": "76 ~ 100"
      }
    }
  ]
}
```

> Boundaries are repeated on purpose (first rule wins), so values like 0.255 are still covered.

## Parameters Integer (0 ~ 100)

```json
{
  "type": "/",
  "rules": [
    {
      "group": "and",
      "conditions": [
        {
          "column": "yp_integer",
          "criteria": "is-null"
        }
      ],
      "output": {
        "background": "transparent",
        "color": "#666666",
        "label": "Fill out value",
        "icon": "StatusCircleQuestionMark"
      }
    },
    {
      "group": "and",
      "conditions": [
        {
          "column": "yp_integer",
          "criteria": "range",
          "min": 0,
          "max": 25
        }
      ],
      "output": {
        "icon": "DislikeSolid",
        "background": "#E098AF",
        "color": "#1F1F1F",
        "label": "0 ~ 25"
      }
    },
    {
      "group": "and",
      "conditions": [
        {
          "column": "yp_integer",
          "criteria": "range",
          "min": 26,
          "max": 50
        }
      ],
      "output": {
        "icon": "Warning",
        "background": "#F4B394",
        "color": "#1F1F1F",
        "label": "26 ~ 50"
      }
    },
    {
      "group": "and",
      "conditions": [
        {
          "column": "yp_integer",
          "criteria": "range",
          "min": 51,
          "max": 75
        }
      ],
      "output": {
        "icon": "LikeSolid",
        "background": "#FAD897",
        "color": "#1F1F1F",
        "label": "51 ~ 75"
      }
    },
    {
      "group": "and",
      "conditions": [
        {
          "column": "yp_integer",
          "criteria": "range",
          "min": 76,
          "max": 100
        }
      ],
      "output": {
        "icon": "LikeSolid",
        "background": "#A1D6A5",
        "color": "#1F1F1F",
        "label": "76 ~ 100"
      }
    }
  ]
}
```
