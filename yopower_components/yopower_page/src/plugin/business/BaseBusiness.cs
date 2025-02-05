using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.PluginTelemetry;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Cryptography.Xml;
using yopower_papps_grid_extensions.earlybound;
using yopower_papps_grid_extensions.helpers;
using yopower_papps_grid_extensions.language;
using yopower_papps_grid_extensions.models;

namespace yopower_papps_grid_extensions.business
{
    public abstract class BaseBusiness
    {
        protected ILogger Logger { get; }
        protected ITracingService TracingService { get; }
        protected IServiceEndpointNotificationService NotificationService { get; }
        protected IOrganizationService Service { get; }
        protected IOrganizationService ServiceAdmin { get; }
        protected List<Resx> Messages { get; }

        protected BaseBusiness(IOrganizationService service, IOrganizationService serviceAdmin, IServiceEndpointNotificationService notificationService, ITracingService tracingService, ILogger logger, List<Resx> messages = null)
        {
            Service = service;
            ServiceAdmin = serviceAdmin;
            NotificationService = notificationService;
            TracingService = tracingService;
            Logger = logger;
            Messages = messages != null ? messages : new List<Resx>();
        }

        protected void TRACE(string format, params object[] args)
        {
            if (this.TracingService != null)
                this.TracingService.Trace(format, args);
        }

        protected void LOG(EventId eventId, string message, LogLevel level, Exception exception = null)
        {
            if (this.Logger != null)
            {
                switch (level)
                {
                    case LogLevel.Information:
                        message = $"📝{message}";
                        break;
                    case LogLevel.Warning:
                        message = $"⚠️{message}";
                        break;
                    case LogLevel.Debug:
                        message = $"🔎{message}";
                        break;
                    case LogLevel.Error:
                        message = $"❌{message}";
                        break;
                    case LogLevel.Critical:
                        message = $"⭕{message}";
                        break;
                }

                if (exception != null)
                    this.Logger.Log(level, eventId, exception, message);
                else
                    this.Logger.Log(level, eventId, message);
            }
        }

        protected void NOTIFY(string message, params object[] args)
        {
            if (this.NotificationService != null)
            {
            }
        }

        // Settings
        private List<SettingValue> GetSettings(List<string> uniqueNames)
        {
            var query = $@"<fetch mapping='logical' >
                              <entity name='{SettingDefinition.EntityLogicalName}' >
                                  <attribute name='{SettingDefinition.Fields.Id}' />
                                  <attribute name='{SettingDefinition.Fields.DataType}' />
                                  <attribute name='{SettingDefinition.Fields.IsOverridable}' />
                                  <attribute name='{SettingDefinition.Fields.OverridableLevel}' />
                                  <attribute name='{SettingDefinition.Fields.ReleaseLevel}' />
                                  <attribute name='{SettingDefinition.Fields.DefaultValue}' />
                                   {FetchHelper.InBuilder(SettingDefinition.Fields.UniqueName, uniqueNames)}
                                  <link-entity name='{OrganizationSetting.EntityLogicalName}' from='{SettingDefinition.Fields.Id}' to='{OrganizationSetting.Fields.SettingDefinitionId}' link-type='outer' alias='organization' >
                                      <attribute name='{OrganizationSetting.Fields.Value}' alias='organization.value' />
                                  </link-entity>
                                  <link-entity name='{AppSetting.EntityLogicalName}' from='{SettingDefinition.Fields.Id}' to='{AppSetting.Fields.SettingDefinitionId}' link-type='outer' alias='appsetting' >
                                      <attribute name='{AppSetting.Fields.Value}' alias='appsetting.value' />
                                      <attribute name='{AppSetting.Fields.ParentAppModuleId}' alias='appsetting.app' />
                                      <link-entity name='{AppModule.EntityLogicalName}' from='{AppModule.Fields.Id}' to='{AppSetting.Fields.ParentAppModuleId}' link-type='outer' alias='appmodule' >
                                          <attribute name='{AppModule.Fields.Id}' alias='appmodule.id' />
                                          <attribute name='{AppModule.Fields.UniqueName}' alias='appmodule.uniquename' />
                                      </link-entity>
                                  </link-entity>
                              </entity>
                            </fetch>";

            var results = this.ServiceAdmin.RetrieveMultiple(new FetchExpression(query));

            if (results.Entities.Count > 0)
                return results.Entities.Select(s => new SettingValue(s.ToEntity<SettingDefinition>())).ToList();
            else
                return new List<SettingValue>();
        }

        public T GetAttribute<T>(Entity target, string logicalName, Entity preImage = null)
        {
            if (preImage == null)
                preImage = new Entity();

            if (target.Contains(logicalName))
                return target.GetAttributeValue<T>(logicalName);
            else if (preImage.Contains(logicalName))
                return preImage.GetAttributeValue<T>(logicalName);
            else
                return default(T);
        }
    }
}
