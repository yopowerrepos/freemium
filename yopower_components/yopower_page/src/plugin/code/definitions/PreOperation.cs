using Microsoft.Xrm.Sdk;
using yopower_papps_grid_extensions.business;
using yopower_papps_grid_extensions.earlybound;
using yopower_papps_grid_extensions.extensions;
using static yopower_papps_grid_extensions.enums.Global;

namespace yopower_papps_grid_extensions.code.definitions
{
    public class PreOperation : PluginBase
    {
        public PreOperation() : base(typeof(PreOperation)) { }

        protected override void ExecuteDataversePlugin(ILocalPluginContext localContext)
        {
            var messages = localContext.LoadResxMessages();
            var serviceAdmin = localContext.FactoryServiceAdmin();

            var business = new ColumnDefinitionBO(localContext.PluginUserService, serviceAdmin, localContext.NotificationService, localContext.TracingService, localContext.Logger, messages);

            var target = new yp_pagridextd_column_definition();
            var image = new yp_pagridextd_column_definition();
            var refTarget = new EntityReference();

            switch (localContext.PluginExecutionContext.MessageName.ToUpper())
            {
                case "CREATE":
                    target = localContext.GetTarget<yp_pagridextd_column_definition>();
                    switch ((eMode)localContext.PluginExecutionContext.Mode)
                    {
                        case eMode.SYNC:
                            business.ValidateColumnDefinition(target);
                            break;

                        case eMode.ASYNC:
                            break;
                    }
                    break;

                case "UPDATE":
                    target = localContext.GetTarget<yp_pagridextd_column_definition>();
                    image = localContext.GetPreImage<yp_pagridextd_column_definition>();
                    switch ((eMode)localContext.PluginExecutionContext.Mode)
                    {
                        case eMode.SYNC:
                            business.ValidateColumnDefinition(target, image);
                            break;

                        case eMode.ASYNC:
                            break;
                    }
                    break;

                case "DELETE":
                    refTarget = localContext.GetEntityReference();
                    image = localContext.GetPreImage<yp_pagridextd_column_definition>();
                    switch ((eMode)localContext.PluginExecutionContext.Mode)
                    {
                        case eMode.SYNC:
                            break;

                        case eMode.ASYNC:
                            break;
                    }
                    break;
            }
        }
    }
}
