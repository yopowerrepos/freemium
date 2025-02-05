using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace yopower_papps_grid_extensions.enums
{
    public static class Global
    {
        public enum MessageName
        {
            Create,
            Update,
            Delete,
            Associate,
            Disassociate,
            Retrieve,
            RetrieveMultiple
        }

        public enum eMode
        {
            SYNC = 0,
            ASYNC = 1
        }

        protected enum PipelineStage
        {
            PreValidation = 10,
            PreOperation = 20,
            PostOperation = 40
        }
    }
}
