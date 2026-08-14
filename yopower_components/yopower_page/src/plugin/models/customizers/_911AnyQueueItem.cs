using System.Runtime.Serialization;

namespace yopower_papps_grid_extensions.models.customizers
{
    [DataContract]
    public class _911AnyQueueItem
    {
        [DataMember(Name = "add", Order = 1, IsRequired = true)] public bool AllowAdd { get; set; }
        [DataMember(Name = "remove", Order = 2, IsRequired = true)] public bool AllowRemove { get; set; }
        [DataMember(Name = "pick", Order = 3, IsRequired = true)] public bool AllowPick { get; set; }
        [DataMember(Name = "release", Order = 4, IsRequired = true)] public bool AllowRelease { get; set; }
        [DataMember(Name = "distributeOptions", Order = 5, IsRequired = false)] public string[] DistributeOptions { get; set; }
    }
}
