using System.Collections.Generic;
using System.Runtime.Serialization;
using yopower_papps_grid_extensions.models.customizers.common;

namespace yopower_papps_grid_extensions.models.customizers
{
    [DataContract]
    public class _900AnyNavigateTo
    {
        [DataMember(Name = "modal", Order = 1, IsRequired = true)] public List<NavigateToSettings> Modal { get; set; }
        [DataMember(Name = "sidePane", Order = 3, IsRequired = true)] public List<CreateSidePanelSettings> SidePane { get; set; }
    }
}