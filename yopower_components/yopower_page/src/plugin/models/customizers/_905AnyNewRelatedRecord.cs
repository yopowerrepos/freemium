using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using yopower_papps_grid_extensions.models.customizers.common;

namespace yopower_papps_grid_extensions.models.customizers
{
    [DataContract]
    public class _905AnyNewRelatedRecord
    {
        [DataMember(Name = "options", Order = 1, IsRequired = true)] public List<_905AnyNewRelatedRecordSettings> Options { get; set; }
    }

    [DataContract]
    public class _905AnyNewRelatedRecordSettings
    {
        [DataMember(Name = "label", Order = 1, IsRequired = true)] public string Label { get; set; }
        [DataMember(Name = "formId", Order = 2, IsRequired = true)] public Guid FormId { get; set; }
        [DataMember(Name = "targetTableLogicalName", Order = 3, IsRequired = true)] public string TargetTableLogicalName { get; set; }
        [DataMember(Name = "useQuickCreateForm", Order = 4, IsRequired = true)] public bool UseQuickCreateForm { get; set; }
        [DataMember(Name = "icon", Order = 5, IsRequired = false)] public string Icon { get; set; }
        [DataMember(Name = "height", Order = 6, IsRequired = false)] public NavigateToSize Height { get; set; }
        [DataMember(Name = "width", Order = 7, IsRequired = false)] public NavigateToSize Width { get; set; }
    }
}