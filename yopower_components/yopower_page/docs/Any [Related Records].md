
# Any [Related Records]

- ✅ Any column type
- ⚠️ The `reference` property defines whether the `row` or a `column` is used to substitute the placeholder `#value#`.

## Parameters

```json
{
  "reference": "column/row",
  "column": "yp_accountid",
  "viewId": "00000000-0000-0000-0000-000000000010",
  "viewName": "Related Phone Calls",
  "rules": [
    {
      "min": 1,
      "max": 1,
      "background": "#A1D6A5",
      "color": "#1F1F1F",
      "icon": "AlertSolid"
    },
    {
      "min": 2,
      "max": 10,
      "background": "#E098AF",
      "color": "#1F1F1F"
    }
  ],
  "table": "phonecall",
  "fetchXmlAggregate": "<fetch version='1.0' mapping='logical' distinct='false' aggregate='true'><entity name='phonecall'><attribute name='activityid' alias='value' aggregate='count' /><link-entity name='account' from='accountid' to='regardingobjectid' link-type='inner' alias='aa'><filter type='and'><condition attribute='accountid' operator='eq' uitype='#valuetype#' value='#value#' /></filter></link-entity></entity></fetch>",
  "fetchXml": "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'><entity name='phonecall'><attribute name='subject' /><attribute name='statecode' /><attribute name='prioritycode' /><attribute name='scheduledend' /><attribute name='createdby' /><attribute name='regardingobjectid' /><attribute name='activityid' /><link-entity name='account' from='accountid' to='regardingobjectid' link-type='inner' alias='aa'><filter type='and'><condition attribute='accountid' operator='eq' uitype='#valuetype#' value='#value#' /></filter></link-entity></entity></fetch>",
  "layoutXml": "<grid name='resultset' object='1' jump='createdon' select='1' icon='1' preview='1'><row name='result' id='activityid'><cell name='createdon' width='150' /><cell name='subject' width='200' /><cell name='prioritycode' width='100' /><cell name='scheduledstart' width='150' /><cell name='scheduledend' width='150' /><cell name='statuscode' width='100' /></row></grid>"
}
```