#pragma warning disable CS1591
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.42000
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace yopower_papps_grid_extensions.earlybound
{
	
	
	[System.Runtime.Serialization.DataContractAttribute(Namespace="http://schemas.microsoft.com/xrm/2011/new/")]
	[Microsoft.Xrm.Sdk.Client.RequestProxyAttribute("AISentiment")]
	public partial class AISentimentRequest : Microsoft.Xrm.Sdk.OrganizationRequest
	{
		
		public string Text
		{
			get
			{
				if (this.Parameters.Contains("Text"))
				{
					return ((string)(this.Parameters["Text"]));
				}
				else
				{
					return default(string);
				}
			}
			set
			{
				this.Parameters["Text"] = value;
			}
		}
		
		public AISentimentRequest()
		{
			this.RequestName = "AISentiment";
			this.Text = default(string);
		}
	}
	
	[System.Runtime.Serialization.DataContractAttribute(Namespace="http://schemas.microsoft.com/xrm/2011/new/")]
	[Microsoft.Xrm.Sdk.Client.ResponseProxyAttribute("AISentiment")]
	public partial class AISentimentResponse : Microsoft.Xrm.Sdk.OrganizationResponse
	{
		
		public AISentimentResponse()
		{
		}
		
		public string AnalyzedSentiment
		{
			get
			{
				if (this.Results.Contains("AnalyzedSentiment"))
				{
					return ((string)(this.Results["AnalyzedSentiment"]));
				}
				else
				{
					return default(string);
				}
			}
		}
	}
}
#pragma warning restore CS1591
