using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace yopower_papps_grid_extensions.models.types
{
    [DataContract]
    public class NavigateToModel
    {
        [DataMember(Name = "modal", Order = 1, IsRequired = true)] public List<NavigateToSettingsModel> Modal { get; set; }
        [DataMember(Name = "sidePane", Order = 3, IsRequired = true)] public List<CreateSidePanelSettingsModel> SidePane { get; set; }
    }

    [DataContract]
    public class NavigateToSettingsModel
    {
        [DataMember(Name = "position", Order = 1, IsRequired = true)] public int Position { get; set; }
        [DataMember(Name = "formId", Order = 2, IsRequired = true)] public Guid FormId { get; set; }
        [DataMember(Name = "label", Order = 3, IsRequired = true)] public string Label { get; set; }
        [DataMember(Name = "height", Order = 4, IsRequired = true)] public NavigateToSizeModel Height { get; set; }
        [DataMember(Name = "width", Order = 5, IsRequired = true)] public NavigateToSizeModel Width { get; set; }
    }

    [DataContract]
    public class NavigateToSizeModel
    {
        [DataMember(Name = "value", Order = 1, IsRequired = true)] public int Value { get; set; }
        [DataMember(Name = "unit", Order = 2, IsRequired = true)] public string Unit { get; set; }
    }


    [DataContract]
    public class CreateSidePanelSettingsModel
    {
        [DataMember(Name = "label", Order = 2, IsRequired = true)] public string Label { get; set; }
        [DataMember(Name = "paneId", Order = 3, IsRequired = true)] public string PaneId { get; set; }
        [DataMember(Name = "canClose", Order = 4, IsRequired = true)] public bool CanClose { get; set; }
        [DataMember(Name = "imageSrc", Order = 5, IsRequired = true)] public string ImageSrc { get; set; }
        [DataMember(Name = "hideHeader", Order = 6, IsRequired = true)] public bool HideHeader { get; set; }
        [DataMember(Name = "width", Order = 7, IsRequired = true)] public decimal Width { get; set; }
    }
}
