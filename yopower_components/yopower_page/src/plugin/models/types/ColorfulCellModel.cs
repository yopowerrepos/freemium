using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace yopower_papps_grid_extensions.models.types
{
    [DataContract]
    public class ColorfulCellModel
    {
        [DataMember(Name = "rules", Order = 1, IsRequired = true)] public List<ColorfulCellRuleModel> Rules { get; set; }
    }

    [DataContract]
    public class ColorfulCellRuleModel
    {
        [DataMember(Name = "min", Order = 1, IsRequired = true)] public decimal Min { get; set; }
        [DataMember(Name = "max", Order = 2, IsRequired = true)] public decimal Max { get; set; }
        [DataMember(Name = "background", Order = 3, IsRequired = true)] public string Background { get; set; }
        [DataMember(Name = "color", Order = 4, IsRequired = true)] public string Color { get; set; }
        [DataMember(Name = "label", Order = 5, IsRequired = true)] public string Label { get; set; }

    }
}
