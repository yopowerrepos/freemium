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
    public class ColumnModel
    {
        [DataMember(Order = 1)]
        public string DisplayName { get; set; }

        [DataMember(Order = 2)]
        public string LogicalName { get; set; }

        [DataMember(Order = 3)]
        public OptionSetModel Type { get; set; }

        [DataMember(Order = 4)]
        public OptionSetModel Format { get; set; }

        [DataMember(Order = 5)]
        public bool IsCustom { get; set; }

        [DataMember(Order = 6)]
        public List<OptionSetModel> Options { get; set; }
    }
}
