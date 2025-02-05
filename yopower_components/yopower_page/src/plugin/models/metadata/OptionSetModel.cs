using Microsoft.Xrm.Sdk.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace yopower_papps_grid_extensions.models.metadata
{
    [DataContract]
    public class OptionSetModel
    {
        [DataMember(Order = 1)]
        public string DisplayName;

        [DataMember(Order = 2)]
        public int Value;

        [DataMember(Order = 3)]
        public string Color;
    }
}
