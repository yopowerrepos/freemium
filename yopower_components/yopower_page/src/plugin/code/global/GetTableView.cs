using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using yopower_papps_grid_extensions.business;
using yopower_papps_grid_extensions.extensions;

namespace yopower_papps_grid_extensions.code.global
{
    public class GetTableView : PluginBase
    {
        public GetTableView() : base(typeof(GetTableView)) { }

        protected override void ExecuteDataversePlugin(ILocalPluginContext localContext)
        {
            try
            {
                var messages = localContext.LoadResxMessages();
                var serviceAdmin = localContext.FactoryServiceAdmin();

                var business = new MetadataBO(localContext.PluginUserService, serviceAdmin, localContext.NotificationService, localContext.TracingService, localContext.Logger, messages);

                var viewId = (Guid)localContext.PluginExecutionContext.InputParameters["viewId"];

                // Output Parameters
                localContext.PluginExecutionContext.OutputParameters["view"] = JsonConvert.SerializeObject(business.GetTableView(viewId));
                localContext.PluginExecutionContext.OutputParameters["success"] = true;
                localContext.PluginExecutionContext.OutputParameters["message"] = string.Empty;
            }
            catch (Exception ex)
            {
                localContext.PluginExecutionContext.OutputParameters["view"] = "{}";
                localContext.PluginExecutionContext.OutputParameters["success"] = false;
                localContext.PluginExecutionContext.OutputParameters["message"] = ex.Message;
            }
        }
    }
}