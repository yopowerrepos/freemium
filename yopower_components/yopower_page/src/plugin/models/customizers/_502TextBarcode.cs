using System.Runtime.Serialization;

namespace yopower_papps_grid_extensions.models.customizers
{
    [DataContract]
    public class _502TextBarcode
    {
        [DataMember(Name = "layout", Order = 1, IsRequired = false)] public string Layout { get; set; }
        [DataMember(Name = "format", Order = 2, IsRequired = false)] public string Format { get; set; }
    }
}
