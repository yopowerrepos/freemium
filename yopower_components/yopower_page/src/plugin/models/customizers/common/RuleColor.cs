using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace yopower_papps_grid_extensions.models.customizers.common
{
    [DataContract]
    public class RuleColor
    {
        [DataMember(Name = "criteria", Order = 1, IsRequired = false)] public string Criteria { get; set; }
        [DataMember(Name = "min", Order = 2, IsRequired = false)] public decimal Min { get; set; }
        [DataMember(Name = "max", Order = 3, IsRequired = false)] public decimal Max { get; set; }
        [DataMember(Name = "background", Order = 4, IsRequired = true)] public string Background { get; set; }
        [DataMember(Name = "color", Order = 5, IsRequired = true)] public string Color { get; set; }
        [DataMember(Name = "icon", Order = 6, IsRequired = false)] public string Icon { get; set; }
        [DataMember(Name = "label", Order = 7, IsRequired = false)] public string Label { get; set; }
    }
}
