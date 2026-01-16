using System;
using System.Runtime.Serialization;

namespace yopower_papps_grid_extensions.models.customizers.common
{
    [DataContract]
    public class NavigateToSettings
    {
        [DataMember(Name = "position", Order = 1, IsRequired = true)] public int Position { get; set; }
        [DataMember(Name = "formId", Order = 2, IsRequired = true)] public Guid FormId { get; set; }
        [DataMember(Name = "label", Order = 3, IsRequired = true)] public string Label { get; set; }
        [DataMember(Name = "height", Order = 4, IsRequired = true)] public NavigateToSize Height { get; set; }
        [DataMember(Name = "width", Order = 5, IsRequired = true)] public NavigateToSize Width { get; set; }
        [DataMember(Name = "tabName", Order = 6, IsRequired = false)] public string TabName { get; set; }
    }
}
