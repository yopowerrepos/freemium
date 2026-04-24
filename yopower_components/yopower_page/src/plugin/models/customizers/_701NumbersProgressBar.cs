using System.Collections.Generic;
using System.Runtime.Serialization;
using yopower_papps_grid_extensions.models.customizers.common;

namespace yopower_papps_grid_extensions.models.customizers
{
    [DataContract]
    public class _701NumbersProgressBar
    {
        [DataMember(Name = "type", Order = 1, IsRequired = true)] public string Type { get; set; }

        [DataMember(Name = "rules", Order = 1, IsRequired = true)] public List<RuleColor> Rules { get; set; }
    }
}
