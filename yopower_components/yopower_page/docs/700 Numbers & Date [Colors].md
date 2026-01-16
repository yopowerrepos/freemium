# Numbers & Date [Colorful Cell]

- ✅ Decimal, Integer, Float, Currency, Duration, Date Only and Date&Time
- 📝 Use double click to enter on edit mode
- ⚠️ For Duration, Date Only and Date&Time columns utilize min and max properties as minutes

## Parameters for Date Only, Date&Time or Duration

```json
{
  "rules": [
    {
      "min": -10000000000,
      "max": 0,
      "background": "#E098AF",
      "color": "#1F1F1F",
      "label": "Passed date in minutes", // optional
      "icon": "BufferTimeBefore" // optional
    },
    {
      "min": 1,
      "max": 10080,
      "background": "#FAD897",
      "color": "#1F1F1F",
      "label": "Next week in minutes", // optional
      "icon": "BufferTimeBoth" // optional
    },
    {
      "min": 10081,
      "max": 10000000000,
      "background": "#A1D6A5",
      "color": "#1F1F1F",
      "label": "After next week in minutes", // optional
      "icon": "BufferTimeAfter" // optional
    }
  ]
}
```

## Parameters for Decimal, Integer, Float or Currency

```json
{
  "rules": [
    {
      "min": -10000000000,
      "max": -1,
      "background": "#E098AF",
      "color": "#1F1F1F",
      "label": "Positive", // optional
      "icon": "ArrowTallDownLeft" // optional
    },
    {
      "min": 0,
      "max": 0,
      "background": "transparent",
      "color": "#666666"
    },
    {
      "min": 1,
      "max": 10000000000,
      "background": "#A1D6A5",
      "color": "#1F1F1F",
      "label": "Negative", // optional
      "icon": "ArrowTallUpRight" // optional
    }
  ]
}
```