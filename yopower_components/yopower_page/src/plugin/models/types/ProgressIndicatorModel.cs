using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace yopower_papps_grid_extensions.models.types
{
    [DataContract]
    public class ProgressIndicatorModel
    {
        [DataMember(Name = "type", Order = 1, IsRequired = true)] public string Type { get; set; }
        [DataMember(Name = "rules", Order = 2, IsRequired = true)] public List<ColorfulCellRuleModel> Rules { get; set; }
    }
}