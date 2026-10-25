using System.Runtime.Serialization;

namespace yopower_papps_grid_extensions.models.customizers
{
    [DataContract]
    public class _501TextQRCode
    {
        [DataMember(Name = "layout", Order = 1, IsRequired = false)] public string Layout { get; set; }
    }
}
