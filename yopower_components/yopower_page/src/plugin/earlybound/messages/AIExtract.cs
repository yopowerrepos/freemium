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
	[Microsoft.Xrm.Sdk.Client.RequestProxyAttribute("AIExtract")]
	public partial class AIExtractRequest : Microsoft.Xrm.Sdk.OrganizationRequest
	{
		
		public string Entity
		{
			get
			{
				if (this.Parameters.Contains("Entity"))
				{
					return ((string)(this.Parameters["Entity"]));
				}
				else
				{
					return default(string);
				}
			}
			set
			{
				this.Parameters["Entity"] = value;
			}
		}
		
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
		
		public AIExtractRequest()
		{
			this.RequestName = "AIExtract";
			this.Entity = default(string);
			this.Text = default(string);
		}
	}
	
	[System.Runtime.Serialization.DataContractAttribute(Namespace="http://schemas.microsoft.com/xrm/2011/new/")]
	[Microsoft.Xrm.Sdk.Client.ResponseProxyAttribute("AIExtract")]
	public partial class AIExtractResponse : Microsoft.Xrm.Sdk.OrganizationResponse
	{
		
		public AIExtractResponse()
		{
		}
		
		public string[] ExtractedData
		{
			get
			{
				if (this.Results.Contains("ExtractedData"))
				{
					return ((string[])(this.Results["ExtractedData"]));
				}
				else
				{
					return default(string[]);
				}
			}
		}
	}
}
#pragma warning restore CS1591
