using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace yopower_papps_grid_extensions.models
{
    [DataContract]
    public class OptionSetCondition
    {
        [DataMember(Order = 1, Name = "column")] public string Column { get; set; }
        [DataMember(Order = 2, Name = "operator")] public int Operator { get; set; }
        [DataMember(Order = 3, Name = "values")] public List<string> Values { get; set; }

    }
}
