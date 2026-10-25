# Numbers (Duration)

- ✅ Duration (Whole Number column with Duration format)
- 📝 Works on edit mode only, enable **Editable** on the Column Definition
- Replaces the duration dropdown by a spin button where the duration is typed in **hours** as a decimal number, i.e. `1,5` or `1.5` = 90 minutes.
- The value is converted back to minutes when saved.

## Parameters

| **Property** | **Required** | **Description**                        |
| ------------ | ------------ | -------------------------------------- |
| `min`        | Yes          | Minimum value, in hours                |
| `max`        | Yes          | Maximum value, in hours                |
| `step`       | Yes          | Increment of the spin button, in hours |

```json
{
  "min": 0.25,
  "max": 240,
  "step": 0.25
}
```

The sample allows from 15 minutes up to 10 days, in steps of 15 minutes.
