using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml.Linq;
using yopower_papps_grid_extensions.business;
using yopower_papps_grid_extensions.language;

namespace yopower_papps_grid_extensions.extensions
{
    public static class ILocalContextExtensions
    {
        public static IOrganizationService FactoryServiceAdmin(this ILocalPluginContext _this)
        {
            return _this.OrgSvcFactory.CreateOrganizationService(null);
        }
        public static T GetTarget<T>(this ILocalPluginContext _this) where T : Entity
        {
            var target = _this.PluginExecutionContext.InputParameters["Target"] as Entity;

            return target.ToEntity<T>();
        }
        public static T GetPreImage<T>(this ILocalPluginContext _this, string preImageName = "PreImage") where T : Entity
        {
            if (_this.PluginExecutionContext.PreEntityImages.ContainsKey(preImageName))
            {
                var entity = _this.PluginExecutionContext.PreEntityImages[preImageName] as Entity;
                return entity.ToEntity<T>();
            }
            throw new InvalidPluginExecutionException($"❌ PRE-IMAGE '{preImageName}' NOT FOUND!");
        }
        public static T GetPostImage<T>(this ILocalPluginContext _this, string postImageName = "PostImage") where T : Entity
        {
            if (_this.PluginExecutionContext.PreEntityImages.ContainsKey(postImageName))
            {
                var image = _this.PluginExecutionContext.PostEntityImages[postImageName] as Entity;
                return image.ToEntity<T>();
            }
            throw new InvalidPluginExecutionException($"❌ POST-IMAGE '{postImageName}' NOT FOUND!");
        }
        public static EntityReference GetEntityReference(this ILocalPluginContext _this)
        {
            return _this.PluginExecutionContext.InputParameters["Target"] as EntityReference;
        }
        public static EntityReferenceCollection GetEntityReferenceCollection(this ILocalPluginContext _this)
        {
            return _this.PluginExecutionContext.InputParameters["RelatedEntities"] as EntityReferenceCollection;
        }
        public static Relationship GetRelationship(this ILocalPluginContext _this)
        {
            Relationship target = (Relationship)_this.PluginExecutionContext.InputParameters["Relationship"];
            return target;
        }
        public static List<Resx> LoadResxMessages(this ILocalPluginContext _this)
        {
            var messages = new List<Resx>();
            if (!string.IsNullOrEmpty(ResxExtension.webResourceName))
            {
                var metadata = new MetadataBO(_this.PluginUserService, _this.PluginUserService, _this.NotificationService, _this.TracingService, _this.Logger);

                // Get User Language Code
                string languageCode = metadata.GetUserLanguageCode(_this.PluginExecutionContext.InitiatingUserId);

                // Get RESX File
                string resx = metadata.GetResxWebResource($"{ResxExtension.webResourceName}.{languageCode}.resx");

                // Convert
                string resourceContent = Encoding.UTF8.GetString(Convert.FromBase64String(resx));

                string byteOrderMarkUtf8 = Encoding.UTF8.GetString(Encoding.UTF8.GetPreamble());
                if (resourceContent.StartsWith(byteOrderMarkUtf8))
                    resourceContent = resourceContent.Remove(0, byteOrderMarkUtf8.Length);

                return XElement.Parse(resourceContent)
                    .Elements("data")
                    .Select(s => new Resx(s.Attribute("name").Value, s.Element("value").Value.Trim()))
                    .ToList();
            }
            else
                return new List<Resx>();

        }
    }
}
