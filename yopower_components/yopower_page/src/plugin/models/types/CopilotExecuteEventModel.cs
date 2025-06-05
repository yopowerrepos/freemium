using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace yopower_papps_grid_extensions.models.types
{
    [DataContract]
    public class CopilotExecuteEventModel
    {
        [DataMember(Order = 1, Name = "events", IsRequired = true)] public List<CopilotExecuteEventOptionModel> Events { get; set; }
    }

    [DataContract]
    public class CopilotExecuteEventOptionModel
    {
        [DataMember(Order = 1, Name = "event", IsRequired = true)] public string Event { get; set; }
        [DataMember(Order = 2, Name = "label", IsRequired = true)] public string Label { get; set; }
        [DataMember(Order = 3, Name = "tooltip", IsRequired = false)] public string Tooltip { get; set; }
    }
}
