using System.Runtime.Serialization;

namespace yopower_papps_grid_extensions.models.customizers
{
    [DataContract]
    public class _909AnyColorByHex
    {
        [DataMember(Name = "column", Order = 1, IsRequired = true)] public string Column { get; set; }
    }
}
