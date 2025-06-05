using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using yopower_papps_grid_extensions.earlybound;

namespace yopower_papps_grid_extensions.models.metadata
{
    [DataContract]
    public class ViewModel
    {
        public ViewModel(SavedQuery view)
        {
            this.Id = view.Id;
            this.Name = view.Name;
        }

        public ViewModel(SavedQuery view, List<ColumnModel> columns)
        {
            this.Id = view.Id;
            this.Name = view.Name;
            this.Desription = view.Description;
            this.FetchXml = view.FetchXml;
            this.LayoutXml = view.LayoutXml;
            this.Columns = columns;
        }

        [DataMember(Name = "id", Order = 1)] public Guid Id { get; set; }
        [DataMember(Name = "name", Order = 2)] public string Name { get; set; }
        [DataMember(Name = "description", Order = 3)] public string Desription { get; set; }
        [DataMember(Name = "fetchXml", Order = 4)] public string FetchXml { get; set; }
        [DataMember(Name = "layoutXml", Order = 5)] public string LayoutXml { get; set; }
        [DataMember(Name = "columns", Order = 6)] public List<ColumnModel> Columns { get; set; }
    }
}
