using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace yopower_papps_grid_extensions.models.types
{
    [DataContract]
    public class FileUploadDownloadModel
    {
        [DataMember(Name = "readOnly", Order = 1, IsRequired = true)] public bool ReadOnly { get; set; }
        [DataMember(Name = "allowedTypes", Order = 2, IsRequired = true)] public List<string> AllowedTypes { get; set; }
    }
}
