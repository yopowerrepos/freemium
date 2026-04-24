using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace yopower_papps_grid_extensions.models.customizers
{
    [DataContract]
    public class _906AnyNotes
    {
        public static void EnsureFetchXmlQuery(QueryExpression query)
        {
            var errors = new StringBuilder();
            if (!query.EntityName.Equals("annotation", StringComparison.InvariantCultureIgnoreCase))
                errors.AppendLine("fetchXml should point to annotations!");

            var requiredColumns = new List<string>()
            { "annotationid", "subject", "notetext", "createdon", "createdby", "modifiedon", "modifiedby", "isdocument", "filename" };

            var missingColumns = requiredColumns
                .Join(query.ColumnSet.Columns,
                    r_ => r_.ToLower(),
                    e_ => e_.ToLower(),
                    (r_, e_) => new { r_, e_ }
                ).ToList();

            if (missingColumns.Count != 0)
                errors.AppendLine($"Missing columns: {string.Join(", ", missingColumns)}");

            if (errors.Length > 0)
                throw new InvalidPluginExecutionException($"❌{errors.ToString()}");
        }

        public static void EnsureFetchXmlAggregateQuery(QueryExpression query)
        {
            var errors = new StringBuilder();
            if (!query.EntityName.Equals("annotation", StringComparison.InvariantCultureIgnoreCase))
                errors.AppendLine("fetchXmlAggregate should point to annotations!");

            if (query.ColumnSet.AttributeExpressions.Where(w => w.AggregateType == XrmAggregateType.Count && w.AttributeName == "annotationid" && w.Alias == "count").Count() != 1)
                errors.AppendLine("Missing definition <attribute name='annotationid' aggregate='count' alias='count'/>");

            if (errors.Length > 0)
                throw new InvalidPluginExecutionException($"❌{errors.ToString()}");
        }

        [DataMember(Order = 1, Name = "popUpLastModified", IsRequired = true)] public bool LastOnly { get; set; }
        [DataMember(Order = 2, Name = "reference", IsRequired = true)] public string Reference { get; set; }
        [DataMember(Order = 3, Name = "column", IsRequired = true)] public string Column { get; set; }
        [DataMember(Order = 4, Name = "fetchXmlAggregate", IsRequired = true)] public string FetchXmlAggregate { get; set; }
        [DataMember(Order = 5, Name = "fetchXml", IsRequired = true)] public string FetchXml { get; set; }
    }
}
