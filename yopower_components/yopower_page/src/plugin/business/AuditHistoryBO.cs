using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.PluginTelemetry;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using yopower_papps_grid_extensions.language;
using yopower_papps_grid_extensions.models.audit;

namespace yopower_papps_grid_extensions.business
{
    public class AuditHistoryBO : BaseBusiness
    {
        public AuditHistoryBO(IOrganizationService service, IOrganizationService serviceAdmin, IServiceEndpointNotificationService notificationService, ITracingService tracingService, ILogger logger, List<Resx> messages = null) : base(service, serviceAdmin, notificationService, tracingService, logger, messages)
        {
        }

        public List<AuditDetailModel> GetColumnAuditHistory(EntityReference refRecord, string columnLogicalName)
        {
            var metadata = new MetadataBO(this.Service, this.ServiceAdmin, this.NotificationService, this.TracingService, this.Logger, this.Messages);

            var options = metadata.ParseOptions(refRecord.LogicalName, columnLogicalName);

            var request = new RetrieveAttributeChangeHistoryRequest()
            {
                Target = refRecord,
                AttributeLogicalName = columnLogicalName
            };
            var response = (RetrieveAttributeChangeHistoryResponse)Service.Execute(request);

            if (response.AuditDetailCollection != null && response.AuditDetailCollection.AuditDetails != null)
            {
                return response.AuditDetailCollection.AuditDetails
                    .Where(w => w.GetType() == typeof(AttributeAuditDetail))
                    .Select(s => new AuditDetailModel((AttributeAuditDetail)s, columnLogicalName, options))
                    .ToList();
            }
            else
                return new List<AuditDetailModel>();
        }
    }
}