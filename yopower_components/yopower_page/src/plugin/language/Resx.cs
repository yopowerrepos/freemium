using System.Collections.Generic;
using System.Linq;

namespace yopower_papps_grid_extensions.language
{
    public class Resx
    {
        private string id;
        private string message;

        public string Id { get => id; }
        public string Message { get => message; }

        public Resx(string id, string message)
        {
            this.id = id;
            this.message = message;
        }
    }

    public static class ResxExtension
    {
        public static string webResourceName = string.Empty;

        public static string GetMessageById(this List<Resx> list, string id)
        {
            return list.Where(w => w.Id == id).Select(s => s.Message).FirstOrDefault();
        }
    }
}
