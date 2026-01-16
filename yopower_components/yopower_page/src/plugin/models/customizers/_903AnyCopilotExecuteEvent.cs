using System.Collections.Generic;
using System.Runtime.Serialization;

namespace yopower_papps_grid_extensions.models.customizers
{
    [DataContract]
    public class _903AnyCopilotExecuteEvent
    {
        [DataMember(Order = 1, Name = "events", IsRequired = true)] public List<_903AnyCopilotExecuteEventOption> Events { get; set; }
    }

    [DataContract]
    public class _903AnyCopilotExecuteEventOption
    {
        [DataMember(Order = 1, Name = "event", IsRequired = true)] public string Event { get; set; }
        [DataMember(Order = 2, Name = "label", IsRequired = true)] public string Label { get; set; }
        [DataMember(Order = 3, Name = "tooltip", IsRequired = false)] public string Tooltip { get; set; }
    }
}
