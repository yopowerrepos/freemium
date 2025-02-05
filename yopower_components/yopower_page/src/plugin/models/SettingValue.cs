using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using yopower_papps_grid_extensions.earlybound;

namespace yopower_papps_grid_extensions.models
{
    public class SettingValue
    {
        public SettingValue(SettingDefinition settingDefinition)
        {
            this.UniqueName = settingDefinition.UniqueName;
            this.Type = settingDefinition.DataType.Value;
            this.IsOverridable = settingDefinition.IsOverridable.Value;
            this.OverridableLevel = settingDefinition.OverridableLevel.Value;
            this.ReleaseLevel = settingDefinition.ReleaseLevel.Value;

            if (settingDefinition.Contains("appsetting.app"))
            {
                this.AppId = ((EntityReference)settingDefinition.GetAttributeValue<AliasedValue>("appmodule.id").Value).Id;
                this.AppUniqueName = settingDefinition.GetAttributeValue<AliasedValue>("appmodule.uniquename").Value.ToString();
            }

            switch (this.Type)
            {
                case settingdefinition_datatype.String:
                    this.Value = settingDefinition.DefaultValue;

                    if (settingDefinition.Contains("organization.value"))
                        this.OrgValue = (string)settingDefinition.GetAttributeValue<AliasedValue>("organization.value").Value;

                    if (settingDefinition.Contains("appsetting.value"))
                        this.AppValue = (string)settingDefinition.GetAttributeValue<AliasedValue>("appsetting.value").Value;
                    break;

                case settingdefinition_datatype.Number:
                    if (settingDefinition.DefaultValue != null)
                        this.Value = Convert.ToInt32(settingDefinition.DefaultValue);

                    if (settingDefinition.Contains("organization.value"))
                        this.OrgValue = Convert.ToInt32(settingDefinition.GetAttributeValue<AliasedValue>("organization.value").Value);

                    if (settingDefinition.Contains("appsetting.value"))
                        this.AppValue = Convert.ToInt32(settingDefinition.GetAttributeValue<AliasedValue>("appsetting.value").Value);
                    break;

                case settingdefinition_datatype.Boolean:
                    if (settingDefinition.DefaultValue != null)
                        this.Value = Convert.ToBoolean(settingDefinition.DefaultValue);

                    if (settingDefinition.Contains("organization.value"))
                        this.OrgValue = Convert.ToBoolean(settingDefinition.GetAttributeValue<AliasedValue>("organization.value").Value);

                    if (settingDefinition.Contains("appsetting.value"))
                        this.AppValue = Convert.ToBoolean(settingDefinition.GetAttributeValue<AliasedValue>("appsetting.value").Value);
                    break;

            }
        }

        public string UniqueName { get; private set; }
        public settingdefinition_datatype Type { get; private set; }
        public bool IsOverridable { get; private set; }
        public settingdefinition_overridablelevel OverridableLevel { get; private set; }
        public settingdefinition_releaselevel ReleaseLevel { get; private set; }
        public object Value { get; private set; }
        public object OrgValue { get; private set; }
        public object AppValue { get; private set; }
        public Guid AppId { get; private set; }
        public string AppUniqueName { get; private set; }
    }
}
