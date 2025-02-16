using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace yopower_papps_grid_extensions.models.types
{
    [DataContract]
    public class StringRelatedRecords
    {
        [DataMember(Order = 1, Name = "reference", IsRequired = true)] public string Reference { get; set; }
        [DataMember(Order = 2, Name = "column", IsRequired = true)] public string Column { get; set; }
        [DataMember(Order = 4, Name = "background", IsRequired = true)] public string Background { get; set; }
        [DataMember(Order = 5, Name = "color", IsRequired = true)] public string Color { get; set; }
        [DataMember(Order = 6, Name = "table", IsRequired = true)] public string Table { get; set; }
        [DataMember(Order = 7, Name = "fetchXmlAggregate", IsRequired = true)] public string FetchXmlAggregate { get; set; }
        [DataMember(Order = 8, Name = "fetchXml", IsRequired = true)] public string FetchXml { get; set; }
        [DataMember(Order = 9, Name = "layoutXml", IsRequired = true)] public string LayoutXml { get; set; }
    }
}
