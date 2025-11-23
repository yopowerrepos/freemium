
# Any [Related Records]

- ✅ Any column type (represents the row) | Lookup
- ⚠️ The `reference` property defines whether the `row` or a `column` is used to be compared with the lookup defined per item.

## Parameters

```json
{
  "reference": "column",
  "column": "yp_accountid",
  "items": [
    {
      "table": "task",
      "id": "activityid",
      "lookup": "regardingobjectid",
      "orderby": "scheduledstart",
      "title": "subject",
      "description": "description",
      "optionset": "statecode",
      "rules": [
        {
          "value": 0,
          "icon": "StatusCircleBlock2",
          "color": "#666666"
        },
        {
          "value": 1,
          "icon": "SkypeCircleCheck",
          "color": "#44AE4C"
        },
        {
          "value": 2,
          "icon": "StatusErrorFull",
          "color": "#C1315F"
        }
      ]
    },
    {
      "table": "phonecall",
      "id": "activityid",
      "lookup": "regardingobjectid",
      "orderby": "scheduledstart",
      "title": "subject",
      "description": "description",
      "optionset": "statecode",
      "rules": [
        {
          "value": 0,
          "icon": "StatusCircleBlock2",
          "color": "#666666"
        },
        {
          "value": 1,
          "icon": "SkypeCircleCheck",
          "color": "#44AE4C"
        },
        {
          "value": 2,
          "icon": "StatusErrorFull",
          "color": "#C1315F"
        }
      ]
    },
    {
      "table": "yp_demo_powerappsgrid_extensions",
      "id": "yp_demo_powerappsgrid_extensionsid",
      "lookup": "yp_accountid",
      "orderby": "createdon",
      "title": "yp_name",
      "description": "yp_text",
      "optionset": "statuscode",
      "rules": [
        {
          "value": 0,
          "icon": "StatusCircleBlock2",
          "color": "#666666"
        },
        {
          "value": 1,
          "icon": "SkypeCircleCheck",
          "color": "#44AE4C"
        }
      ]
    }
  ]
}
```