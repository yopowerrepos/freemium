﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace yopower_papps_grid_extensions.models.types
{
    [DataContract]
    public class FilteredLookupModel
    {
        [DataMember(Name = "reference", Order = 1, IsRequired = true)] public string Reference { get; set; }
        [DataMember(Name = "column", Order = 2, IsRequired = true)] public string Column { get; set; }
        [DataMember(Name = "viewId", Order = 3, IsRequired = true)] public Guid ViewId { get; set; }
        [DataMember(Name = "filter", Order = 4, IsRequired = true)] public string Filter { get; set; }
    }
}
