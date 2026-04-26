# Numbers & Date [Colorful Cell]

- ✅ Decimal, Integer, Float, Currency, Duration, Date Only and Date&Time
- 📝 Use double click to enter on edit mode
- ⚠️ For Duration, Date Only and Date&Time columns utilize min and max properties as minutes

## column

The column should be the same informed on the field yp_subgrid_column!

## criteria

'is-null', 'not-null' or 'range'
- range: required include min and max (in minutes)
- is-null
- not-null

## Parameters for Date Only, Date&Time or Duration

```json
{
  "rules": [
    {
      "group": "and",
      "conditions": [
        {
          "column": "yp_datetime",
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
          "column": "yp_datetime",
          "criteria": "range",
          "min": -10000000000,
          "max": 0
        }
      ],
      "output": {
        "background": "#E098AF",
        "color": "#1F1F1F",
        "label": "Passed date in minutes",
        "icon": "BufferTimeBefore"
      }
    },
    {
      "group": "and",
      "conditions": [
        {
          "column": "yp_datetime",
          "criteria": "range",
          "min": 1,
          "max": 10080
        }
      ],
      "output": {
        "background": "#FAD897",
        "color": "#1F1F1F",
        "label": "Next week in minutes",
        "icon": "BufferTimeBoth"
      }
    },
    {
      "group": "and",
      "conditions": [
        {
          "column": "yp_datetime",
          "criteria": "range",
          "min": 10081,
          "max": 10000000000
        }
      ],
      "output": {
        "background": "#A1D6A5",
        "color": "#1F1F1F",
        "label": "After next week in minutes",
        "icon": "BufferTimeAfter"
      }
    }
  ]
}
```

## Parameters for Decimal, Integer, Float or Currency

```json
{
    "rules": [
      {
        "group": "and",
        "conditions": [
          {
            "column": "yp_currency",
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
            "column": "yp_currency",
            "criteria": "range",
            "min": -10000000000,
            "max": 500000
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
            "column": "yp_currency",
            "criteria": "range",
            "min": 500001,
            "max": 1000000
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
            "column": "yp_currency",
            "criteria": "range",
            "min": 1000000,
            "max": 9999999999999
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