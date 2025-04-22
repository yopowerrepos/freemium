using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace yopower_papps_grid_extensions.models
{
    [DataContract]
    public class AdditionalSettings
    {
        [DataMember(Name = "editable", Order = 1, IsRequired = false)] public bool Editable { get; set; }
        [DataMember(Name = "allowPin", Order = 2, IsRequired = false)] public bool AllowPin { get; set; }
        [DataMember(Name = "renameColumn", Order = 3, IsRequired = false)] public string RenameColumn { get; set; }
    }
}
