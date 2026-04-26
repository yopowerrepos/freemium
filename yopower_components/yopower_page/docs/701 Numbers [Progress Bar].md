
# Numbers (Progress Bar)

- ✅ Integer, Decimal and Float
- 📝 Use double click to enter on edit mode.
- ⚠️ Type options: '_' (column value _ 100) | '/' (column value / 100) | empty

## column

The column should be the same informed on the field yp_subgrid_column!

## criteria

'is-null', 'not-null' or 'range'
- range: required include min and max
- is-null
- not-null

## Parameters Decimal (0 > 1)

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
        "label": "Fillout date",
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
          "min": 0.26,
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
          "min": 0.51,
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
          "min": 0.76,
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

## Parameters Integer

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
        "label": "Fillout date",
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