using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace yopower_papps_grid_extensions.models.customizers.common
{
    [DataContract]
    public class NavigateToSize
    {
        [DataMember(Name = "value", Order = 1, IsRequired = true)] public int Value { get; set; }
        [DataMember(Name = "unit", Order = 2, IsRequired = true)] public string Unit { get; set; }
    }
}
