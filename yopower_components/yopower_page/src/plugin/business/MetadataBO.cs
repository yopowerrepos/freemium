﻿using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk.PluginTelemetry;
using System;
using System.Collections.Generic;
using System.Linq;
using yopower_papps_grid_extensions.earlybound;
using yopower_papps_grid_extensions.language;
using yopower_papps_grid_extensions.models.metadata;

namespace yopower_papps_grid_extensions.business
{
    public class MetadataBO : BaseBusiness
    {
        public MetadataBO(IOrganizationService service, IOrganizationService serviceAdmin, IServiceEndpointNotificationService notificationService, ITracingService tracingService, ILogger logger, List<Resx> messages = null) : base(service, serviceAdmin, notificationService, tracingService, logger, messages)
        {
        }

        public TableModel GetMetadataTable(string table)
        {
            RetrieveEntityResponse response = null;
            try
            {
                var request = new RetrieveEntityRequest()
                {
                    LogicalName = table,
                    EntityFilters = Microsoft.Xrm.Sdk.Metadata.EntityFilters.Entity | Microsoft.Xrm.Sdk.Metadata.EntityFilters.Attributes
                };
                response = (RetrieveEntityResponse)this.Service.Execute(request);
            }
            catch (Exception ex)
            {
                return null;
            }

            if (response != null)
                return new TableModel(response.EntityMetadata);
            else
                return null;
        }

        /// <summary>
        /// Get OptionSet Values
        /// </summary>
        /// <param name="table">Table</param>
        /// <param name="column">Column</param>
        /// <returns></returns>
        public EnumAttributeMetadata GetOptionSet(string table, string column)
        {
            var request = new RetrieveAttributeRequest
            {
                EntityLogicalName = table,
                LogicalName = column,
                RetrieveAsIfPublished = true
            };

            var response = (RetrieveAttributeResponse)this.ServiceAdmin.Execute(request);
            return (EnumAttributeMetadata)response.AttributeMetadata;
        }

        /// <summary>
        /// Calculate Rollup Collumns
        /// </summary>
        /// <param name="target">Ref. Target</param>
        /// <param name="columns">Columns</param>
        public void CalculateRollupColumns(EntityReference target, string[] columns)
        {
            var request = new ExecuteTransactionRequest()
            {
                ReturnResponses = false,
                Requests = new OrganizationRequestCollection()
            };

            request.Requests.AddRange(columns.Select(s => new CalculateRollupFieldRequest()
            {
                Target = target,
                FieldName = s
            }));


            this.ServiceAdmin.Execute(request);
        }

        /// <summary>
        /// Get User Language Code
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>Language Code</returns>
        public string GetUserLanguageCode(Guid userId)
        {
            using (var orgContext = new CrmServiceContext(this.ServiceAdmin))
            {
                int? languageCode = orgContext.UserSettingsSet.Where(w => w.SystemUserId == userId).Select(s => s.UILanguageId).FirstOrDefault();
                if (languageCode.HasValue && languageCode != 0)
                    return languageCode.Value.ToString();
                else
                    return orgContext.OrganizationSet.Select(s => s.LanguageCode).FirstOrDefault().Value.ToString();
            }
        }

        /// <summary>
        /// Get RESX Web Resource
        /// </summary>
        /// <param name="name">Name</param>
        /// <returns>XML</returns>
        public string GetResxWebResource(string name)
        {
            using (var orgContext = new CrmServiceContext(this.ServiceAdmin))
            {
                var webResources = orgContext.WebResourceSet.
                    Where(w => w.Name == name
                    && w.WebResourceType == webresource_webresourcetype.String_RESX
                    && w.Content != null).
                    Select(s => new WebResource()
                    {
                        WebResourceId = s.WebResourceId,
                        ContentJson = s.ContentJson,
                        Content = s.Content
                    }).ToList();

                // Um arquivo encontrado
                if (webResources.Count == 1)
                    return webResources.FirstOrDefault().Content;
                else
                    throw new InvalidPluginExecutionException($"❌ Error on retrieve RESX file '{name}'");
            }
        }
    }
}
