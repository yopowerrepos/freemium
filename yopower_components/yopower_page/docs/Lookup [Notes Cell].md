# Lookup [Notes Cell]

- ✅ Allow display notes related to the row, lookups or using a custom fetchxml to group them.
- Required include those attributes when the query is customized: annotationid, subject, notetext, createdon, createdby, modifiedon, modifiedby, isdocument and filename

## Parameters - Notes related to the row

```json
{
  "reference": "row",
  "column": "",
  "fetchXmlAggregate": "",
  "fetchXml": ""
}
```

## Parameters - Notes related to the column lookup (Account)

```json
{
  "reference": "column",
  "column": "yp_accountid",
  "fetchXmlAggregate": "",
  "fetchXml": ""
}
```

## Parameters - Notes related Contacts, related to the column lookup (Account)

```json
{
  "reference": "column",
  "column": "yp_accountid",
  "fetchXmlAggregate": "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' aggregate='true'><entity name='annotation'><attribute name='annotationid' aggregate='count' alias='count' /><link-entity name='contact' from='contactid' to='objectid' link-type='inner' alias='contact'><filter type='and'><condition attribute='parentcustomerid' operator='eq' uitype='#valuetype#' value='#value#' /></filter></link-entity></entity></fetch>",
  "fetchXml": "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'><entity name='annotation'><attribute name='annotationid' /><attribute name='subject' /><attribute name='notetext' /><attribute name='createdon' /><attribute name='createdby' /><attribute name='modifiedon' /><attribute name='modifiedby' /><attribute name='isdocument' />    <attribute name='filename' /><link-entity name='contact' from='contactid' to='objectid' link-type='inner' alias='contact'><filter type='and'><condition attribute='parentcustomerid' operator='eq' uitype='#valuetype#' value='#value#' /></filter></link-entity></entity></fetch>"
}
```