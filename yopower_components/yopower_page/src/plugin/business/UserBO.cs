using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.PluginTelemetry;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using yopower_papps_grid_extensions.earlybound;
using yopower_papps_grid_extensions.language;

namespace yopower_papps_grid_extensions.business
{
    public class UserBO : BaseBusiness
    {
        public UserBO(IOrganizationService service, IOrganizationService serviceAdmin, IServiceEndpointNotificationService notificationService, ITracingService tracingService, ILogger logger, List<Resx> messages = null) : base(service, serviceAdmin, notificationService, tracingService, logger, messages)
        {

        }

        public List<Role> GetSecurityRoles(Guid initialUserId)
        {
            var query = $@"<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true'>
                            <entity name='role'>
                                <attribute name='roleid'/>
                                <attribute name='name'/>
                                <filter type='or'>
                                    <link-entity name='systemuserroles' from='roleid' to='roleid' visible='false' intersect='true' link-type='any'>
                                        <link-entity name='systemuser' from='systemuserid' to='systemuserid' alias='USER'>
                                            <filter type='and'>
                                                <condition attribute='systemuserid' operator='eq' uitype='systemuser' value='{initialUserId}'/>
                                            </filter>
                                        </link-entity>
                                    </link-entity>
                                    <link-entity name='teamroles' from='roleid' to='roleid' visible='false' intersect='true' link-type='any'>
                                        <link-entity name='team' from='teamid' to='teamid' alias='TEAM'>
                                            <link-entity name='teammembership' from='teamid' to='teamid' visible='false' intersect='true'>
                                                <link-entity name='systemuser' from='systemuserid' to='systemuserid' alias='TEAMMEMBER'>
                                                    <filter type='and'>
                                                        <condition attribute='systemuserid' operator='eq' uitype='systemuser' value='{initialUserId}'/>
                                                    </filter>
                                                </link-entity>
                                            </link-entity>
                                        </link-entity>
                                    </link-entity>
                                </filter>
                            </entity>
                        </fetch>";

            var results = this.ServiceAdmin.RetrieveMultiple(new FetchExpression(query));

            if (results.Entities.Count > 0)
                return results.Entities.Select(s => s.ToEntity<Role>()).ToList();
            else
                return new List<Role>();
        }
    }
}
