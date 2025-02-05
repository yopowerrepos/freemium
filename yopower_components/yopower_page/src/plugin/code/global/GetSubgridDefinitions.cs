using Microsoft.Xrm.Sdk;
using Newtonsoft.Json;
using System;
using yopower_papps_grid_extensions.business;
using yopower_papps_grid_extensions.extensions;

namespace yopower_papps_grid_extensions.code.global
{
    public class GetSubgridDefinitions : PluginBase
    {
        public GetSubgridDefinitions() : base(typeof(GetSubgridDefinitions)) { }

        protected override void ExecuteDataversePlugin(ILocalPluginContext localContext)
        {
            var messages = localContext.LoadResxMessages();
            var serviceAdmin = localContext.FactoryServiceAdmin();

            var business = new ColumnDefinitionBO(localContext.PluginUserService, serviceAdmin, localContext.NotificationService, localContext.TracingService, localContext.Logger, messages);
            var subgrid = (string)localContext.PluginExecutionContext.InputParameters["subgrid"];

            try
            {
                localContext.PluginExecutionContext.OutputParameters["data"] = JsonConvert.SerializeObject(business.GetDefinitions(subgrid));
                localContext.PluginExecutionContext.OutputParameters["success"] = true;
                localContext.PluginExecutionContext.OutputParameters["message"] = string.Empty;
            }
            catch (Exception e)
            {
                localContext.PluginExecutionContext.OutputParameters["data"] = "{}";
                localContext.PluginExecutionContext.OutputParameters["success"] = false;
                localContext.PluginExecutionContext.OutputParameters["message"] = e.Message;
            }
        }
    }
}
