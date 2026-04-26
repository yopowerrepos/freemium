# Any (Dependent Colors)

- 📝 Use double click to enter on edit mode
- ⚠️ Different of 'Numbers & Date [Colorful Cell]' it will define a color according rules

## column

The column defined should be included on grid!

## criteria

'is-null', 'not-null' or 'range'
- range: required include min and max
- is-null
- not-null

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