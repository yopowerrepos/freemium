using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using yopower_papps_grid_extensions.business;
using yopower_papps_grid_extensions.models.metadata;

namespace yopower_papps_grid_extensions.models.types
{
    [DataContract]
    public class CustomTimeLineModel
    {
        [DataMember(Order = 1, Name = "reference", IsRequired = true)] public string Reference { get; set; }
        [DataMember(Order = 2, Name = "column", IsRequired = true)] public string Column { get; set; }
        [DataMember(Order = 3, Name = "items", IsRequired = true)] public List<CustomTimeLineItemModel> Items { get; set; }
    }

    [DataContract]
    public class CustomTimeLineItemModel
    {
        [DataMember(Order = 1, Name = "table", IsRequired = true)] public string Table { get; set; }
        [DataMember(Order = 2, Name = "id", IsRequired = true)] public string Id { get; set; }
        [DataMember(Order = 3, Name = "lookup", IsRequired = true)] public string Lookup { get; set; }
        [DataMember(Order = 4, Name = "orderby", IsRequired = true)] public string OrderBy { get; set; }
        [DataMember(Order = 5, Name = "title", IsRequired = true)] public string Title { get; set; }
        [DataMember(Order = 6, Name = "description", IsRequired = false)] public string Description { get; set; }
        [DataMember(Order = 7, Name = "optionset", IsRequired = true)] public string OptionSet { get; set; }
        [DataMember(Order = 8, Name = "rules", IsRequired = true)] public List<CustomTimeLineItemRuleModel> Rules { get; set; }

        public void EnsureStructure(TableModel table)
        {
            var errors = new StringBuilder();

            var lookupColumn = table.Columns.Where(w => w.LogicalName == this.Lookup).FirstOrDefault();
            if (lookupColumn != null)
            {
                if (lookupColumn.Type != null && lookupColumn.Type.Value != AttributeTypeCode.Lookup.GetHashCode())
                    errors.AppendLine($"'{this.Lookup}' is not a Lookup type.");
            }
            else
                errors.AppendLine($"'{this.Lookup}' not found");

            var orderByColumn = table.Columns.Where(w => w.LogicalName == this.OrderBy).FirstOrDefault();
            if (orderByColumn != null)
            {
                // if (orderByColumn.Type != null && orderByColumn.Type.Value != parentOrderByType.GetHashCode())
                //    errors.AppendLine($"'{this.OrderBy}'[{orderByColumn.Type.Value}] is does not match with {parentOrderByType.GetHashCode()} type.");
            }
            else
                errors.AppendLine($"'{this.OrderBy}' not found");

            var titleColumn = table.Columns.Where(w => w.LogicalName == this.Title).FirstOrDefault();
            if (titleColumn != null)
            {
                if (titleColumn.Type != null && titleColumn.Type.Value != AttributeTypeCode.String.GetHashCode())
                    errors.AppendLine($"'{this.Title}' is not a String type.");
            }
            else
                errors.AppendLine($"'{this.Title}' not found");

            if (!string.IsNullOrEmpty(this.Description))
            {
                var descriptionColumn = table.Columns.Where(w => w.LogicalName == this.Description).FirstOrDefault();
                if (descriptionColumn != null)
                {
                    if (descriptionColumn.Type != null
                        && descriptionColumn.Type.Value != AttributeTypeCode.String.GetHashCode()
                        && descriptionColumn.Type.Value != AttributeTypeCode.Memo.GetHashCode())
                        errors.AppendLine($"'{this.Description}' is not a String or Memo type.");
                }
                else
                    errors.AppendLine($"'{this.Description}' not found");
            }

            var optionSetColumn = table.Columns.Where(w => w.LogicalName == this.OptionSet).FirstOrDefault();
            if (optionSetColumn != null)
            {
                if (optionSetColumn.Type != null
                    && optionSetColumn.Type.Value != AttributeTypeCode.State.GetHashCode()
                    && optionSetColumn.Type.Value != AttributeTypeCode.Status.GetHashCode()
                    && optionSetColumn.Type.Value != AttributeTypeCode.Picklist.GetHashCode())
                    errors.AppendLine($"'{this.OptionSet}'[{optionSetColumn.Type.Value}] is not a State, Status or Picklist type.");
            }
            else
                errors.AppendLine($"'{this.OptionSet}' not found");

            if (!string.IsNullOrEmpty(errors.ToString()))
                throw new InvalidPluginExecutionException(errors.ToString());
        }
    }
    
    [DataContract]
    public class CustomTimeLineItemRuleModel
    {
        [DataMember(Order = 1, Name = "value", IsRequired = true)] public int Value { get; set; }
        [DataMember(Order = 2, Name = "icon", IsRequired = true)] public string Icon { get; set; }
        [DataMember(Order = 3, Name = "color", IsRequired = true)] public string Color { get; set; }


    }
}