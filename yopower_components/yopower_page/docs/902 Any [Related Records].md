# Any (Related Records)

- ✅ Any column type
- ⚠️ The `reference` property defines whether the `row` or a `column` is used to substitute the placeholder `#value#`.

## Parameters
```json
{
  "reference": "column",
  "column": "yp_contactid",
  "viewId": "00000000-0000-0000-0000-000000000010",
  "viewName": "Related Tasks",
  "rules": [
    {
      "group": "and",
      "conditions": [
        {
          "column": "yp_contact_tasks",
          "criteria": "range",
          "min": 0,
          "max": 2
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
          "column": "yp_contact_tasks",
          "criteria": "range",
          "min": 3,
          "max": 5
        }
      ],
      "output": {
        "background": "#666666",
        "color": "#F1F1F1"
      }
    }
  ],
  "table": "task",
  "fetchXmlAggregate": "<fetch version='1.0' mapping='logical' distinct='false' aggregate='true'><entity name='task'><attribute name='activityid' alias='value' aggregate='count' /><link-entity name='contact' from='contactid' to='regardingobjectid' link-type='inner' alias='aa'><filter type='and'><condition attribute='contactid' operator='eq' uitype='#valuetype#' value='#value#' /></filter></link-entity></entity></fetch>",
  "fetchXml": "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'><entity name='task'><attribute name='subject' /><attribute name='statecode' /><attribute name='prioritycode' /><attribute name='scheduledend' /><attribute name='createdby' /><attribute name='regardingobjectid' /><attribute name='activityid' /><link-entity name='contact' from='contactid' to='regardingobjectid' link-type='inner' alias='aa'><filter type='and'><condition attribute='contactid' operator='eq' uitype='#valuetype#' value='#value#' /></filter></link-entity></entity></fetch>",
  "layoutXml": "<grid name='resultset' object='1' jump='createdon' select='1' icon='1' preview='1'><row name='result' id='activityid'><cell name='createdon' width='150' /><cell name='subject' width='200' /><cell name='prioritycode' width='100' /><cell name='scheduledstart' width='150' /><cell name='scheduledend' width='150' /><cell name='statuscode' width='100' /></row></grid>"
}
```
