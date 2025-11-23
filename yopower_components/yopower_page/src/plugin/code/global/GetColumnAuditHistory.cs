using Microsoft.Xrm.Sdk;
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
    public class GetColumnAuditHistory : PluginBase
    {
        public GetColumnAuditHistory() : base(typeof(GetColumnAuditHistory)) { }

        protected override void ExecuteDataversePlugin(ILocalPluginContext localContext)
        {
            var messages = localContext.LoadResxMessages();
            var serviceAdmin = localContext.FactoryServiceAdmin();

            var business = new AuditHistoryBO(localContext.PluginUserService, serviceAdmin, localContext.NotificationService, localContext.TracingService, localContext.Logger, messages);
            var table = (string)localContext.PluginExecutionContext.InputParameters["table"];
            var id = (Guid)localContext.PluginExecutionContext.InputParameters["id"];
            var column = (string)localContext.PluginExecutionContext.InputParameters["column"];

            try
            {
                localContext.PluginExecutionContext.OutputParameters["data"] = JsonConvert.SerializeObject(business.GetColumnAuditHistory(new EntityReference(table, id), column));
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