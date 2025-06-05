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
    public class GetTables : PluginBase
    {
        public GetTables() : base(typeof(GetTables)) { }

        protected override void ExecuteDataversePlugin(ILocalPluginContext localContext)
        {
            try
            {
                var messages = localContext.LoadResxMessages();
                var serviceAdmin = localContext.FactoryServiceAdmin();

                var business = new MetadataBO(localContext.PluginUserService, serviceAdmin, localContext.NotificationService, localContext.TracingService, localContext.Logger, messages);

                // Output Parameters
                localContext.PluginExecutionContext.OutputParameters["tables"] = JsonConvert.SerializeObject(business.GetTables());
                localContext.PluginExecutionContext.OutputParameters["success"] = true;
                localContext.PluginExecutionContext.OutputParameters["message"] = string.Empty;
            }
            catch (Exception ex)
            {
                localContext.PluginExecutionContext.OutputParameters["tables"] = "{[]}";
                localContext.PluginExecutionContext.OutputParameters["success"] = false;
                localContext.PluginExecutionContext.OutputParameters["message"] = ex.Message;
            }
        }
    }
}