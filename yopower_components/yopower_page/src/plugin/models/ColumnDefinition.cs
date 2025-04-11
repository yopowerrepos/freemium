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
    public class ColumnDefinition
    {
        public ColumnDefinition(yp_pagridextd_column_definition row)
        {
            this.Id = row.Id;
            this.Name = row.yp_name;
            this.Type = row.yp_type.Value.GetHashCode();
            this.Subgrid = row.yp_subgrid_name;
            this.Table = row.yp_subgrid_table;
            this.Column = row.yp_subgrid_column;
            this.Parameters = row.yp_parameters;

            if (!string.IsNullOrEmpty(row.yp_based_on_optionset_column)
                && row.yp_optionset_criteria != null
                && !string.IsNullOrEmpty(row.yp_optionset_values))
                this.Condition = new OptionSetCondition()
                {
                    Column = row.yp_based_on_optionset_column,
                    Operator = row.yp_optionset_criteria.Value.GetHashCode(),
                    Values = row.yp_optionset_values.Split(',').ToList()
                };
        }

        [DataMember(Name = "id", Order = 1)] public Guid Id { get; set; }
        [DataMember(Name = "name", Order = 2)] public string Name { get; set; }
        [DataMember(Name = "type", Order = 3)] public int Type { get; set; }
        [DataMember(Name = "subgrid", Order = 4)] public string Subgrid { get; set; }
        [DataMember(Name = "table", Order = 5)] public string Table { get; set; }
        [DataMember(Name = "column", Order = 6)] public string Column { get; set; }
        [DataMember(Name = "parameters", Order = 7)] public string Parameters { get; set; }
        [DataMember(Name = "condition", IsRequired = false, Order = 7)] public OptionSetCondition Condition { get; set; }

    }
}
