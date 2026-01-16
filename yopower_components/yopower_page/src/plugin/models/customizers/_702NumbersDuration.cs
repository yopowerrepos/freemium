using System.Runtime.Serialization;

namespace yopower_papps_grid_extensions.models.customizers
{
    [DataContract]
    public class _702NumbersDuration
    {
        [DataMember(Name = "min", Order = 1, IsRequired = true)] public decimal Min { get; set; }
        [DataMember(Name = "max", Order = 2, IsRequired = true)] public decimal Max { get; set; }
        [DataMember(Name = "step", Order = 3, IsRequired = true)] public decimal Step { get; set; }
    }
}
