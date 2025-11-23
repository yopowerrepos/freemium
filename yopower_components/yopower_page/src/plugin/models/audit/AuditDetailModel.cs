using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using yopower_papps_grid_extensions.models.metadata;

namespace yopower_papps_grid_extensions.models.audit
{
    [DataContract]
    public class AuditDetailModel
    {
        public AuditDetailModel(AttributeAuditDetail auditDetail, string columnLogicalName, List<OptionSetModel> options)
        {
            var user = auditDetail.AuditRecord.GetAttributeValue<EntityReference>("userid");
            if (user != null && !string.IsNullOrEmpty(user.Name))
                this.User = user.Name;
            else
                this.User = "--";

            var createdOn = auditDetail.AuditRecord.GetAttributeValue<DateTime>("createdon");
            this.ModifiedOn = createdOn.ToString("MM-dd-yyyy hh:mm tt");

            if (auditDetail.OldValue.Contains(columnLogicalName) && auditDetail.OldValue.Attributes[columnLogicalName] != null)
            {
                var attributeType = auditDetail.OldValue.Attributes[columnLogicalName].GetType();
                this.Value = GetValue(auditDetail.OldValue, attributeType, columnLogicalName);

                if (options.Count > 0 && attributeType == typeof(OptionSetValue) || attributeType == typeof(bool))
                {
                    var option = options.Where(w => w.Value.ToString() == this.Value).FirstOrDefault();
                    if (option != null)
                    {
                        this.FormattedValue = option.DisplayName;
                        this.Color = option.Color;
                    }
                    else
                    {
                        this.FormattedValue = this.Value;
                        this.Color = "#000000";

                    }
                }
                else
                {
                    this.FormattedValue = this.Value;
                    this.Color = "#000000";
                }
            }
            else
            {
                this.Value = string.Empty;
                this.FormattedValue = string.Empty;
                this.Color = "#000000";
            }
        }

        private string GetValue(Entity oldValue, Type dataType, string columnLogicalName)
        {
            string value = string.Empty;

            switch (dataType.Name.ToLower())
            {
                case "string":
                    value = oldValue.GetAttributeValue<string>(columnLogicalName);
                    break;

                case "boolean":
                    bool boolean = oldValue.GetAttributeValue<bool>(columnLogicalName);
                    value = boolean ? "1" : "0"; //Necessary to take the label
                    break;

                case "int32":
                    value = oldValue.GetAttributeValue<Int32>(columnLogicalName).ToString();
                    break;

                case "decimal":
                    value = oldValue.GetAttributeValue<decimal>(columnLogicalName).ToString();
                    break;

                case "double":
                    value = oldValue.GetAttributeValue<double>(columnLogicalName).ToString();
                    break;

                case "money":
                    value = oldValue.GetAttributeValue<Money>(columnLogicalName).Value.ToString();
                    break;

                case "optionsetvalue":
                    value = oldValue.GetAttributeValue<OptionSetValue>(columnLogicalName).Value.ToString();
                    break;

                case "datetime":
                    value = oldValue.GetAttributeValue<DateTime>(columnLogicalName).ToString("MM-dd-yyyy hh:mm tt");
                    break;

                case "entityreference":
                    value = oldValue.GetAttributeValue<EntityReference>(columnLogicalName).Name;
                    break;
            }
            return value;
        }

        [DataMember(Order = 1, Name = "formattedValue")] public string FormattedValue { get; set; }
        [DataMember(Order = 2, Name = "value")] public string Value { get; set; }
        [DataMember(Order = 3, Name = "color")] public string Color { get; set; }
        [DataMember(Order = 4, Name = "modifiedOn")] public string ModifiedOn { get; set; }
        [DataMember(Order = 5, Name = "user")] public string User { get; set; }
    }
}
