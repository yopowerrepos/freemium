using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using yopower_papps_grid_extensions.earlybound;

namespace yopower_papps_grid_extensions.models
{
    [DataContract]
    public class GetDefinitionsResponse
    {
        public GetDefinitionsResponse(List<yp_pagridextd_column_definition> rows)
        {
            this.Definitions = rows.Select(s => new ColumnDefinition(s)).ToList();
        }

        [DataMember(Name = "definitions", Order = 1)] public List<ColumnDefinition> Definitions { get; set; }
    }
}
