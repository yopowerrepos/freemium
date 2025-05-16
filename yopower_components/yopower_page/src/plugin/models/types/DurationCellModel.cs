using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace yopower_papps_grid_extensions.models.types
{
    [DataContract]
    public class DurationCellModel
    {
        [DataMember(Name = "min", Order = 1, IsRequired = true)] public decimal Min { get; set; }
        [DataMember(Name = "max", Order = 2, IsRequired = true)] public decimal Max { get; set; }
        [DataMember(Name = "step", Order = 3, IsRequired = true)] public decimal Step { get; set; }
    }
}
