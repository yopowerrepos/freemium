using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace yopower_papps_grid_extensions.helpers
{
    public static class FetchHelper
    {
        public static string InBuilder(string column, List<string> list)
        {
            var filter = new StringBuilder();
            if (list != null && list.Count > 0)
            {
                filter.AppendLine("<filter type='and'>");
                if (list.Count == 1)
                {
                    filter.AppendLine($"<condition attribute='{column}' operator='eq' value='{list.FirstOrDefault()}' />");
                }
                else if (list.Count > 1)
                {
                    filter.AppendLine($"<condition attribute='{column}' operator='in'>");
                    filter.AppendLine(String.Concat(list.Select(s => $"<value>{s}</value>").ToArray()));
                    filter.AppendLine("</condition>");
                }
                filter.AppendLine("</filter>");
            }
            return filter.ToString();
        }

        public static string InBuilderPolymorphic(string column, List<EntityReference> list)
        {
            var filter = new StringBuilder();
            if (list != null && list.Count > 0)
            {
                filter.AppendLine("<filter type='and'>");
                if (list.Count == 1)
                {
                    filter.AppendLine($"<condition attribute='{column}' uitype='{list.FirstOrDefault().LogicalName}' operator='eq' value='{list.FirstOrDefault().Id}' />");
                }
                else if (list.Count > 1)
                {
                    filter.AppendLine($"<condition attribute='{column}' operator='in'>");
                    filter.AppendLine(String.Concat(list.Select(s => $"<value uitype='{s.LogicalName}'>{s.Id}</value>").ToArray()));
                    filter.AppendLine("</condition>");
                }
                filter.AppendLine("</filter>");
            }
            return filter.ToString();
        }

        public static string NotInBuilder(string column, List<string> list)
        {
            var filter = new StringBuilder();
            if (list != null && list.Count > 0)
            {
                filter.AppendLine("<filter type='and'>");
                if (list.Count == 1)
                {
                    filter.AppendLine($"<condition attribute='{column}' operator='ne' value='{list.FirstOrDefault()}' />");
                }
                else if (list.Count > 1)
                {
                    filter.AppendLine($"<condition attribute='{column}' operator='not-in'>");
                    filter.AppendLine(String.Concat(list.Select(s => $"<value>{s}</value>").ToArray()));
                    filter.AppendLine("</condition>");
                }
                filter.AppendLine("</filter>");
            }
            return filter.ToString();
        }

        public static EntityCollection Pagination(IOrganizationService service, string query)
        {
            var resultados = new EntityCollection();
            int fetchCount = 5000;
            int pageNumber = 1;
            string pagingCookie = null;

            while (true)
            {
                string xml = CreateXml(query, pagingCookie, pageNumber, fetchCount);

                FetchExpression expression = new FetchExpression(xml);
                var results = service.RetrieveMultiple(expression);
                resultados.Entities.AddRange(results.Entities);
                if (results.MoreRecords)
                {
                    pageNumber++;
                    pagingCookie = results.PagingCookie;
                }
                else
                    break;
            }

            return resultados;
        }

        private static string CreateXml(string xml, string cookie, int page, int count)
        {
            StringReader stringReader = new StringReader(xml);
            XmlTextReader reader = new XmlTextReader(stringReader);

            // Load document
            XmlDocument doc = new XmlDocument();
            doc.Load(reader);

            return CreateXml(doc, cookie, page, count);
        }

        private static string CreateXml(XmlDocument doc, string cookie, int page, int count)
        {
            XmlAttributeCollection attrs = doc.DocumentElement.Attributes;

            if (cookie != null)
            {
                XmlAttribute pagingAttr = doc.CreateAttribute("paging-cookie");
                pagingAttr.Value = cookie;
                attrs.Append(pagingAttr);
            }

            XmlAttribute pageAttr = doc.CreateAttribute("page");
            pageAttr.Value = System.Convert.ToString(page);
            attrs.Append(pageAttr);

            XmlAttribute countAttr = doc.CreateAttribute("count");
            countAttr.Value = System.Convert.ToString(count);
            attrs.Append(countAttr);

            StringBuilder sb = new StringBuilder(1024);
            StringWriter stringWriter = new StringWriter(sb);

            XmlTextWriter writer = new XmlTextWriter(stringWriter);
            doc.WriteTo(writer);
            writer.Close();

            return sb.ToString();
        }
    }
}
