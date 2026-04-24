using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using yopower_papps_grid_extensions.models.customizers.common;

namespace yopower_papps_grid_extensions.models.customizers
{
    [DataContract]
    public class _902AnyRelatedRecords
    {
        [DataMember(Order = 1, Name = "reference", IsRequired = true)] public string Reference { get; set; }
        [DataMember(Order = 2, Name = "viewId", IsRequired = true)] public Guid ViewId { get; set; }
        [DataMember(Order = 2, Name = "viewName", IsRequired = true)] public string ViewName { get; set; }
        [DataMember(Order = 3, Name = "column", IsRequired = true)] public string Column { get; set; }
        [DataMember(Order = 4, Name = "table", IsRequired = true)] public string Table { get; set; }
        [DataMember(Order = 5, Name = "rules", IsRequired = true)] public List<RuleColor> Rules { get; set; }
        [DataMember(Order = 6, Name = "fetchXmlAggregate", IsRequired = true)] public string FetchXmlAggregate { get; set; }
        [DataMember(Order = 7, Name = "fetchXml", IsRequired = true)] public string FetchXml { get; set; }
        [DataMember(Order = 8, Name = "layoutXml", IsRequired = true)] public string LayoutXml { get; set; }
    }
}