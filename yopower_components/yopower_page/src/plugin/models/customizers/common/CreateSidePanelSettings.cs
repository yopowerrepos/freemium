using System;
using System.Runtime.Serialization;

namespace yopower_papps_grid_extensions.models.customizers.common
{
    [DataContract]
    public class CreateSidePanelSettings
    {
        [DataMember(Name = "label", Order = 2, IsRequired = true)] public string Label { get; set; }
        [DataMember(Name = "paneId", Order = 3, IsRequired = true)] public string PaneId { get; set; }
        [DataMember(Name = "formId", Order = 4, IsRequired = true)] public Guid FormId { get; set; }
        [DataMember(Name = "canClose", Order = 5, IsRequired = true)] public bool CanClose { get; set; }
        [DataMember(Name = "imageSrc", Order = 6, IsRequired = true)] public string ImageSrc { get; set; }
        [DataMember(Name = "hideHeader", Order = 7, IsRequired = true)] public bool HideHeader { get; set; }
        [DataMember(Name = "width", Order = 8, IsRequired = true)] public decimal Width { get; set; }
    }
}