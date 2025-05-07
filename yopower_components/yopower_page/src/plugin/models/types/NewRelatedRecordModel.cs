using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace yopower_papps_grid_extensions.models.types
{
    [DataContract]
    public class NewRelatedRecordModel
    {
        [DataMember(Name = "options", Order = 1, IsRequired = true)] public List<NewRelatedRecorSettingsModel> Options { get; set; }
    }

    [DataContract]
    public class NewRelatedRecorSettingsModel
    {
        [DataMember(Name = "icon", Order = 1, IsRequired = false)] public string Icon { get; set; }
        [DataMember(Name = "label", Order = 2, IsRequired = true)] public string Label { get; set; }
        [DataMember(Name = "formId", Order = 3, IsRequired = true)] public Guid FormId { get; set; }
        [DataMember(Name = "targetTableLogicalName", Order = 4, IsRequired = true)] public string TargetTableLogicalName { get; set; }
        [DataMember(Name = "useQuickCreateForm", Order = 5, IsRequired = true)] public bool UseQuickCreateForm { get; set; }
        [DataMember(Name = "height", Order = 6, IsRequired = false)] public NavigateToSizeModel Height { get; set; }
        [DataMember(Name = "width", Order = 7, IsRequired = false)] public NavigateToSizeModel Width { get; set; }
    }
}
