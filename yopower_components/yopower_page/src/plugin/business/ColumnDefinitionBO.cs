using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk.PluginTelemetry;
using Microsoft.Xrm.Sdk.Query;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using yopower_papps_grid_extensions.earlybound;
using yopower_papps_grid_extensions.extensions;
using yopower_papps_grid_extensions.language;
using yopower_papps_grid_extensions.models;
using yopower_papps_grid_extensions.models.types;

namespace yopower_papps_grid_extensions.business
{
    public class ColumnDefinitionBO : BaseBusiness
    {
        public ColumnDefinitionBO(IOrganizationService service, IOrganizationService serviceAdmin, IServiceEndpointNotificationService notificationService, ITracingService tracingService, ILogger logger, List<Resx> messages = null) : base(service, serviceAdmin, notificationService, tracingService, logger, messages)
        {
        }

        /// <summary>
        /// Validate Definition
        /// </summary>
        /// <param name="target">Column Definition</param>
        /// <param name="image">Column Definition = Image</param>
        /// <exception cref="InvalidPluginExecutionException"></exception>
        public void ValidateColumnDefinition(yp_pagridextd_column_definition target, yp_pagridextd_column_definition image = null)
        {
            if (image == null)
                image = new yp_pagridextd_column_definition();

            var type = this.GetAttribute<OptionSetValue>(target, yp_pagridextd_column_definition.Fields.yp_type, image);
            var table = this.GetAttribute<string>(target, yp_pagridextd_column_definition.Fields.yp_subgrid_table, image);
            var column = this.GetAttribute<string>(target, yp_pagridextd_column_definition.Fields.yp_subgrid_column, image);
            var parameters = this.GetAttribute<string>(target, yp_pagridextd_column_definition.Fields.yp_parameters, image);

            var metadataBO = new MetadataBO(this.Service, this.ServiceAdmin, this.NotificationService, this.TracingService, this.Logger, this.Messages);

            var matchTable = metadataBO.GetTable(table);
            var matchColumn = matchTable.Columns.Where(w => w.LogicalName == column).FirstOrDefault();

            if (matchColumn != null)
            {
                var settings = new JsonSerializerSettings { MissingMemberHandling = MissingMemberHandling.Error };

                switch ((yp_gbl_column_definition_type)type.Value)
                {
                    case yp_gbl_column_definition_type.TextRichTextPopover:
                        if (matchColumn.Type.Value != AttributeTypeCode.Memo.GetHashCode()
                            && matchColumn.Type.Value != AttributeTypeCode.String.GetHashCode())
                        {
                            throw new InvalidPluginExecutionException($"⚠️The option 'Text [RichText]' is available for String and Memo columns");
                        }
                        break;

                    case yp_gbl_column_definition_type.AnyNavigateButtons:
                        try
                        {
                            var model = JsonConvert.DeserializeObject<NavigateToModel>(parameters, settings);
                        }
                        catch (Exception jse)
                        {
                            throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                        }
                        break;

                    case yp_gbl_column_definition_type.AnyNewRelatedRecord:
                        try
                        {
                            var model = JsonConvert.DeserializeObject<NewRelatedRecordModel>(parameters, settings);
                        }
                        catch (Exception jse)
                        {
                            throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                        }
                        break;

                    case yp_gbl_column_definition_type.LookupNavigateButtons:
                        if (matchColumn.Type.Value == AttributeTypeCode.Customer.GetHashCode()
                            || matchColumn.Type.Value == AttributeTypeCode.Lookup.GetHashCode()
                            || matchColumn.Type.Value == AttributeTypeCode.Owner.GetHashCode())
                        {
                            try
                            {
                                var model = JsonConvert.DeserializeObject<NavigateToModel>(parameters, settings);
                            }
                            catch (Exception jse)
                            {
                                throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                            }
                        }
                        else
                            throw new InvalidPluginExecutionException($"The option Lookup [Navigate Buttons] is available just for Lookup columns");
                        break;

                    case yp_gbl_column_definition_type.AnyReadOnly:
                        target.yp_parameters = string.Empty;
                        break;

                    case yp_gbl_column_definition_type.LookupFilteredLookup:
                        if (matchColumn.Type.Value == AttributeTypeCode.Customer.GetHashCode()
                            || matchColumn.Type.Value == AttributeTypeCode.Lookup.GetHashCode()
                            || matchColumn.Type.Value == AttributeTypeCode.Owner.GetHashCode())
                        {
                            try
                            {
                                var model = JsonConvert.DeserializeObject<FilteredLookupModel>(parameters, settings);
                            }
                            catch (Exception jse)
                            {
                                throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                            }
                        }
                        else
                            throw new InvalidPluginExecutionException($"The option Lookup [Filtered Lookup] is available just for Lookup columns");
                        break;

                    case yp_gbl_column_definition_type.AnyDependentColorfulCell:
                        try
                        {
                            var model = JsonConvert.DeserializeObject<ColorfulCellModel>(parameters, settings);
                        }
                        catch (Exception jse)
                        {
                            throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                        }
                        break;

                    case yp_gbl_column_definition_type.NumbersDateColorfulCell:
                        if (matchColumn.Type.Value == AttributeTypeCode.DateTime.GetHashCode()
                            || matchColumn.Type.Value == AttributeTypeCode.Integer.GetHashCode()
                            || matchColumn.Type.Value == AttributeTypeCode.Decimal.GetHashCode()
                            || matchColumn.Type.Value == AttributeTypeCode.Double.GetHashCode()
                            || matchColumn.Type.Value == AttributeTypeCode.BigInt.GetHashCode()
                            || matchColumn.Type.Value == AttributeTypeCode.Money.GetHashCode())
                        {
                            try
                            {
                                var model = JsonConvert.DeserializeObject<ColorfulCellModel>(parameters, settings);
                            }
                            catch (Exception jse)
                            {
                                throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                            }
                        }
                        else
                            throw new InvalidPluginExecutionException($"⚠️The option 'Numbers & Date [Colorful Cel]' is available for Date Only, Date Time, Integer, Decimal and Double columns");
                        break;

                    case yp_gbl_column_definition_type.NumbersProgressBar:
                        if (matchColumn.Type.Value == AttributeTypeCode.Integer.GetHashCode()
                            || matchColumn.Type.Value == AttributeTypeCode.Decimal.GetHashCode()
                            || matchColumn.Type.Value == AttributeTypeCode.Double.GetHashCode()
                            || matchColumn.Type.Value == AttributeTypeCode.BigInt.GetHashCode())
                        {
                            try
                            {
                                var model = JsonConvert.DeserializeObject<ProgressIndicatorModel>(parameters, settings);
                            }
                            catch (Exception jse)
                            {
                                throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                            }
                        }
                        else
                            throw new InvalidPluginExecutionException($"⚠️The option 'Numbers [Progress Indicator]' is available for Integer, Decimal and Double columns");
                        break;

                    case yp_gbl_column_definition_type.NumbersDuration:
                        if (matchColumn.Type.Value == AttributeTypeCode.Integer.GetHashCode())
                        {
                            try
                            {
                                var model = JsonConvert.DeserializeObject<DurationCellModel>(parameters, settings);
                            }
                            catch (Exception jse)
                            {
                                throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                            }
                        }
                        else
                            throw new InvalidPluginExecutionException($"⚠️The option 'Numbers [Duration]' is available for Integer, Decimal and Double columns");
                        break;

                    case yp_gbl_column_definition_type.AnyRelatedRecords:
                        try
                        {
                            var model = JsonConvert.DeserializeObject<AnyRelatedRecords>(parameters, settings);
                        }
                        catch (Exception jse)
                        {
                            throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                        }
                        break;

                    case yp_gbl_column_definition_type.FileUploadDownload:
                        try
                        {
                            var model = JsonConvert.DeserializeObject<FileUploadDownloadModel>(parameters, settings);
                        }
                        catch (Exception jse)
                        {
                            throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                        }
                        break;

                    case yp_gbl_column_definition_type.AnyCopilotExecuteEvent:
                        try
                        {
                            var model = JsonConvert.DeserializeObject<CopilotExecuteEventModel>(parameters, settings);
                        }
                        catch (Exception jse)
                        {
                            throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                        }
                        break;

                    case yp_gbl_column_definition_type.AnyNotes:
                        try
                        {
                            var model = JsonConvert.DeserializeObject<NoteCellModel>(parameters, settings);
                            if (!string.IsNullOrEmpty(model.FetchXmlAggregate))
                            {
                                var fetchxml = model.FetchXmlAggregate.Replace("#valuetype#", "account").Replace("#value#", Guid.Empty.ToString());
                                var query = ((FetchXmlToQueryExpressionResponse)this.ServiceAdmin.Execute(new FetchXmlToQueryExpressionRequest() { FetchXml = fetchxml })).Query;
                                NoteCellModel.EnsureFetchXmlAggregateQuery(query);
                            }
                            if (!string.IsNullOrEmpty(model.FetchXml))
                            {
                                var fetchxml = model.FetchXmlAggregate.Replace("#valuetype#", "account").Replace("#value#", Guid.Empty.ToString());
                                var query = ((FetchXmlToQueryExpressionResponse)this.ServiceAdmin.Execute(new FetchXmlToQueryExpressionRequest() { FetchXml = fetchxml })).Query;
                                NoteCellModel.EnsureFetchXmlQuery(query);
                            }
                        }
                        catch (Exception jse)
                        {
                            throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                        }
                        break;

                    case yp_gbl_column_definition_type.AnyAuditHistory:
                        break;

                    case yp_gbl_column_definition_type.AnyCustomTimeline:
                        try
                        {
                            var model = JsonConvert.DeserializeObject<CustomTimeLineModel>(parameters, settings);
                            foreach (var item_ in model.Items)
                                item_.EnsureStructure(metadataBO.GetTable(item_.Table));
                        }
                        catch (Exception jse)
                        {
                            throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                        }
                        break;

                    default:
                        throw new InvalidPluginExecutionException($"❌Type not implemented!");
                }
            }
            else
                throw new InvalidPluginExecutionException($"Column '{column}' not found on '{table}' table.");
        }

        /// <summary>
        /// Get Column Definition Response
        /// </summary>
        /// <returns></returns>
        public GetDefinitionsResponse GetDefinitions(Guid initialUserId, string subgrid)
        {
            return new GetDefinitionsResponse(this.GetColumnDefinitions(initialUserId, subgrid));
        }

        /// <summary>
        /// Get Active Column Definitions
        /// </summary>
        /// <returns>List Column Definitions</returns>
        private List<yp_pagridextd_column_definition> GetColumnDefinitions(Guid initialUserId, string subgrid)
        {
            var userBO = new UserBO(this.Service, this.ServiceAdmin, this.NotificationService, this.TracingService, this.Logger, this.Messages);

            using (var orgContext = new CrmServiceContext(this.ServiceAdmin))
            {
                var roles = userBO.GetSecurityRoles(initialUserId);

                var definitions = orgContext.yp_pagridextd_column_definitionSet
                    .Where(w => w.statuscode == yp_pagridextd_column_definition_statuscode.Active
                        && w.yp_subgrid_name == subgrid)
                    .Select(s => new yp_pagridextd_column_definition()
                    {
                        Id = s.Id,
                        yp_name = s.yp_name,
                        yp_type = s.yp_type,
                        yp_shortcut = s.yp_shortcut,
                        yp_subgrid_name = s.yp_subgrid_name,
                        yp_subgrid_table = s.yp_subgrid_table,
                        yp_subgrid_column = s.yp_subgrid_column,
                        yp_elegible_for_security_roles = s.yp_elegible_for_security_roles,
                        yp_parameters = s.yp_parameters,
                        yp_based_on_optionset_column = s.yp_based_on_optionset_column,
                        yp_optionset_criteria = s.yp_optionset_criteria,
                        yp_optionset_values = s.yp_optionset_values,
                        yp_editable = s.yp_editable,
                        yp_allow_pin = s.yp_allow_pin,
                        yp_rename_column = s.yp_rename_column
                    })
                    .ToList();

                var openDefinitions = new List<yp_pagridextd_column_definition>();
                if (definitions != null && definitions.Count > 0)
                    openDefinitions = definitions
                    .Where(w => w.yp_elegible_for_security_roles == null
                        || w.yp_elegible_for_security_roles == "")
                    .ToList();

                var roleDefinitions = new List<yp_pagridextd_column_definition>();
                if (definitions != null && definitions.Count > 0 && roles.Count > 0)
                {
                    roleDefinitions = definitions
                        .Where(w => !string.IsNullOrEmpty(w.yp_elegible_for_security_roles)
                            && w.yp_elegible_for_security_roles
                                .Split(',')
                                .Intersect(roles.Select(r => r.Name))
                                .Any())
                        .ToList();
                }

                var elegibleDefinitions = new List<yp_pagridextd_column_definition>();
                elegibleDefinitions.AddRange(openDefinitions);
                elegibleDefinitions.AddRange(roleDefinitions);

                return elegibleDefinitions;
            }
        }

    }
}
