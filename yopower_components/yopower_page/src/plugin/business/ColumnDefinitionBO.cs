using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Metadata;
using Microsoft.Xrm.Sdk.PluginTelemetry;
using Microsoft.Xrm.Sdk.Query;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Drawing.Imaging;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using yopower_papps_grid_extensions.earlybound;
using yopower_papps_grid_extensions.extensions;
using yopower_papps_grid_extensions.language;
using yopower_papps_grid_extensions.models;
using yopower_papps_grid_extensions.models.customizers;

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
                    case yp_gbl_column_definition_type._500TextRichTextPopover: Ensure500RichTextPopover(matchColumn); break;
                    case yp_gbl_column_definition_type._600FileManagement: Ensure600FileManagement(parameters, settings); break;
                    case yp_gbl_column_definition_type._700NumbersDateColors: Ensure700NumbersDateColors(parameters, matchColumn, settings); break;
                    case yp_gbl_column_definition_type._701NumbersProgressBar: Ensure701NumbersProgressBar(parameters, matchColumn, settings); break;
                    case yp_gbl_column_definition_type._702NumbersDuration: Ensure702NumbersDuration(parameters, matchColumn, settings); break;
                    case yp_gbl_column_definition_type._800LookupNavigateTo: Ensure800LookupNavigateTo(parameters, matchColumn, settings); break;
                    case yp_gbl_column_definition_type._801LookupFilteredLookup: Ensure801LookupFilteredLookup(parameters, matchColumn, settings); break;
                    case yp_gbl_column_definition_type._900AnyNavigateTo: Ensure900AnyNavigateTo(parameters, settings); break;
                    case yp_gbl_column_definition_type._901AnyReadOnly: target.yp_parameters = string.Empty; break;
                    case yp_gbl_column_definition_type._902AnyRelatedRecords: Ensure902AnyRelatedRecords(parameters, settings); break;
                    case yp_gbl_column_definition_type._903AnyCopilotExecuteEvent: Ensure903AnyCopilotExecuteEvent(parameters, settings); break;
                    case yp_gbl_column_definition_type._904AnyDependentColors: Ensure904AnyDependentColors(parameters, settings); break;
                    case yp_gbl_column_definition_type._905AnyNewRelatedRecord: Ensure905AnyNewRelatedRecord(parameters, settings); break;
                    case yp_gbl_column_definition_type._906AnyNotes: Ensure906AnyNotes(parameters, settings); break;
                    case yp_gbl_column_definition_type._907AnyAuditHistory: target.yp_parameters = string.Empty; break;
                    case yp_gbl_column_definition_type._908AnyCustomTimeline: Ensure908AnyCustomTimeline(parameters, metadataBO, settings); break;
                    case yp_gbl_column_definition_type._909AnyColorbyHex: Ensure909AnyColorByHex(parameters, settings); break;
                    default: throw new InvalidPluginExecutionException($"❌Type not implemented!");
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

        #region Customizers
        private void Ensure909AnyColorByHex(string parameters, JsonSerializerSettings settings)
        {
            try
            {
                var model = JsonConvert.DeserializeObject<_909AnyColorByHex>(parameters, settings);
            }
            catch (Exception jse)
            {
                throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
            }
        }
        private void Ensure908AnyCustomTimeline(string parameters, MetadataBO metadataBO, JsonSerializerSettings settings)
        {
            try
            {
                var model = JsonConvert.DeserializeObject<_908AnyCustomTimeline>(parameters, settings);
                foreach (var item_ in model.Items)
                    item_.EnsureStructure(metadataBO.GetTable(item_.Table));
            }
            catch (Exception jse)
            {
                throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
            }
        }
        private void Ensure906AnyNotes(string parameters, JsonSerializerSettings settings)
        {
            try
            {
                var model = JsonConvert.DeserializeObject<_906AnyNotes>(parameters, settings);
                if (!string.IsNullOrEmpty(model.FetchXmlAggregate))
                {
                    var fetchxml = model.FetchXmlAggregate.Replace("#valuetype#", "account").Replace("#value#", Guid.Empty.ToString());
                    var query = ((FetchXmlToQueryExpressionResponse)this.ServiceAdmin.Execute(new FetchXmlToQueryExpressionRequest() { FetchXml = fetchxml })).Query;
                    _906AnyNotes.EnsureFetchXmlAggregateQuery(query);
                }
                if (!string.IsNullOrEmpty(model.FetchXml))
                {
                    var fetchxml = model.FetchXmlAggregate.Replace("#valuetype#", "account").Replace("#value#", Guid.Empty.ToString());
                    var query = ((FetchXmlToQueryExpressionResponse)this.ServiceAdmin.Execute(new FetchXmlToQueryExpressionRequest() { FetchXml = fetchxml })).Query;
                    _906AnyNotes.EnsureFetchXmlQuery(query);
                }
            }
            catch (Exception jse)
            {
                throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
            }
        }
        private void Ensure905AnyNewRelatedRecord(string parameters, JsonSerializerSettings settings)
        {
            try
            {
                var model = JsonConvert.DeserializeObject<_905AnyNewRelatedRecord>(parameters, settings);
            }
            catch (Exception jse)
            {
                throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
            }
        }
        private void Ensure904AnyDependentColors(string parameters, JsonSerializerSettings settings)
        {
            try
            {
                var model = JsonConvert.DeserializeObject<_904AnyDependentColors>(parameters, settings);
            }
            catch (Exception jse)
            {
                throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
            }
        }
        private void Ensure903AnyCopilotExecuteEvent(string parameters, JsonSerializerSettings settings)
        {
            try
            {
                var model = JsonConvert.DeserializeObject<_903AnyCopilotExecuteEvent>(parameters, settings);
            }
            catch (Exception jse)
            {
                throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
            }
        }
        private void Ensure902AnyRelatedRecords(string parameters, JsonSerializerSettings settings)
        {
            try
            {
                var model = JsonConvert.DeserializeObject<_902AnyRelatedRecords>(parameters, settings);
            }
            catch (Exception jse)
            {
                throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
            }
        }
        private void Ensure900AnyNavigateTo(string parameters, JsonSerializerSettings settings)
        {
            try
            {
                var model = JsonConvert.DeserializeObject<_900AnyNavigateTo>(parameters, settings);
            }
            catch (Exception jse)
            {
                throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
            }
        }
        private void Ensure801LookupFilteredLookup(string parameters, models.metadata.ColumnModel matchColumn, JsonSerializerSettings settings)
        {
            if (matchColumn.Type.Value == AttributeTypeCode.Customer.GetHashCode()
                || matchColumn.Type.Value == AttributeTypeCode.Lookup.GetHashCode()
                || matchColumn.Type.Value == AttributeTypeCode.Owner.GetHashCode())
            {
                try
                {
                    var model = JsonConvert.DeserializeObject<_801LookupFilteredLookup>(parameters, settings);
                }
                catch (Exception jse)
                {
                    throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                }
            }
            else
                throw new InvalidPluginExecutionException($"The option Lookup [Filtered Lookup] is available just for Lookup columns");
        }
        private void Ensure800LookupNavigateTo(string parameters, models.metadata.ColumnModel matchColumn, JsonSerializerSettings settings)
        {
            if (matchColumn.Type.Value == AttributeTypeCode.Customer.GetHashCode()
                || matchColumn.Type.Value == AttributeTypeCode.Lookup.GetHashCode()
                || matchColumn.Type.Value == AttributeTypeCode.Owner.GetHashCode())
            {
                try
                {
                    var model = JsonConvert.DeserializeObject<_800LookupNavigateTo>(parameters, settings);
                }
                catch (Exception jse)
                {
                    throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                }
            }
            else
                throw new InvalidPluginExecutionException($"The option Lookup [Navigate Buttons] is available just for Lookup columns");
        }
        private void Ensure702NumbersDuration(string parameters, models.metadata.ColumnModel matchColumn, JsonSerializerSettings settings)
        {
            if (matchColumn.Type.Value == AttributeTypeCode.Integer.GetHashCode())
            {
                try
                {
                    var model = JsonConvert.DeserializeObject<_702NumbersDuration>(parameters, settings);
                }
                catch (Exception jse)
                {
                    throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                }
            }
            else
                throw new InvalidPluginExecutionException($"⚠️The option 'Numbers [Duration]' is available for Integer, Decimal and Double columns");
        }
        private void Ensure701NumbersProgressBar(string parameters, models.metadata.ColumnModel matchColumn, JsonSerializerSettings settings)
        {
            if (matchColumn.Type.Value == AttributeTypeCode.Integer.GetHashCode()
                || matchColumn.Type.Value == AttributeTypeCode.Decimal.GetHashCode()
                || matchColumn.Type.Value == AttributeTypeCode.Double.GetHashCode()
                || matchColumn.Type.Value == AttributeTypeCode.BigInt.GetHashCode())
            {
                try
                {
                    var model = JsonConvert.DeserializeObject<_701NumbersProgressBar>(parameters, settings);
                }
                catch (Exception jse)
                {
                    throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                }
            }
            else
                throw new InvalidPluginExecutionException($"⚠️The option 'Numbers [Progress Indicator]' is available for Integer, Decimal and Double columns");
        }
        private void Ensure700NumbersDateColors(string parameters, models.metadata.ColumnModel matchColumn, JsonSerializerSettings settings)
        {
            if (matchColumn.Type.Value == AttributeTypeCode.DateTime.GetHashCode()
                || matchColumn.Type.Value == AttributeTypeCode.Integer.GetHashCode()
                || matchColumn.Type.Value == AttributeTypeCode.Decimal.GetHashCode()
                || matchColumn.Type.Value == AttributeTypeCode.Double.GetHashCode()
                || matchColumn.Type.Value == AttributeTypeCode.BigInt.GetHashCode()
                || matchColumn.Type.Value == AttributeTypeCode.Money.GetHashCode())
            {
                try
                {
                    var model = JsonConvert.DeserializeObject<_700NumbersNDateTimeColors>(parameters, settings);
                }
                catch (Exception jse)
                {
                    throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
                }
            }
            else
                throw new InvalidPluginExecutionException($"⚠️The option 'Numbers & Date [Colorful Cel]' is available for Date Only, Date Time, Integer, Decimal and Double columns");
        }
        private void Ensure600FileManagement(string parameters, JsonSerializerSettings settings)
        {
            try
            {
                var model = JsonConvert.DeserializeObject<_600FileManagement>(parameters, settings);
            }
            catch (Exception jse)
            {
                throw new InvalidPluginExecutionException($"❌Check the parameters: {jse.Message}.");
            }
        }
        private void Ensure500RichTextPopover(models.metadata.ColumnModel matchColumn)
        {
            if (matchColumn.Type.Value != AttributeTypeCode.Memo.GetHashCode()
                && matchColumn.Type.Value != AttributeTypeCode.String.GetHashCode())
            {
                throw new InvalidPluginExecutionException($"⚠️The option 'Text [RichText]' is available for String and Memo columns");
            }
        }
        #endregion
    }
}
