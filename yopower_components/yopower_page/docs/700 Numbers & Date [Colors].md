# Numbers & Date (Colors)

- ✅ Integer, Big Integer, Decimal, Float, Currency, Duration, Date Only and Date&Time
- 📝 Enable **Editable** on the Column Definition and click the cell to enter edit mode
- ⚠️ For Duration, Date Only and Date&Time columns `min` and `max` are in **minutes**
  - Date Only / Date&Time: difference between the value and now (negative = past, positive = future)
  - Duration: the duration value itself

## How rules are evaluated

- Rules are evaluated in order and the **first matching rule wins**, so the order matters. Boundaries may be repeated on two rules, the first one takes the shared value.
- `group` is `and` (all conditions must match) or `or` (any condition). Default: `or`.
- `min` and `max` are **inclusive**.
- If no rule matches, the cell keeps the default grid rendering.

## column

Every condition `column` must be the same informed on the field `yp_subgrid_column` (validated by the plugin). To color a cell based on another column use [904 Any (Dependent Colors)](904%20Any%20[Dependent%20Colors].md).

## criteria

- `range`: requires `min` and `max` (`max` >= `min`)
- `is-null`: without `min` / `max`
- `is-not-null`: without `min` / `max`

## output

| **Property** | **Required** | **Description**                                                                                                |
| ------------ | ------------ | -------------------------------------------------------------------------------------------------------------- |
| `background` | Yes          | Cell background color                                                                                          |
| `color`      | Yes          | Text color                                                                                                     |
| `label`      | No           | Shown on the tooltip                                                                                           |
| `icon`       | No           | [Fluent UI icon](https://developer.microsoft.com/en-us/fluentui#/styles/web/icons) name shown before the value |

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
        "label": "Fill out date",
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

> Date differences are whole minutes, so integer boundaries (0 / 1, 10080 / 10081) leave no gaps.

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
        "label": "Fill out value",
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
          "min": 500000,
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
        "label": "High priority",
        "icon": "FavoriteStarFill"
      }
    }
  ]
}
```

> The boundaries (500000, 1000000) are repeated on purpose: the first rule wins, and decimal values between two rules (i.e. 500000.50) are still covered.
