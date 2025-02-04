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
	
	
	/// <summary>
	/// Drop-down list for selecting the type of the web resource.
	/// </summary>
	[System.Runtime.Serialization.DataContractAttribute()]
	public enum webresource_webresourcetype
	{
		
		[System.Runtime.Serialization.EnumMemberAttribute()]
		Webpage_HTML = 1,
		
		[System.Runtime.Serialization.EnumMemberAttribute()]
		StyleSheet_CSS = 2,
		
		[System.Runtime.Serialization.EnumMemberAttribute()]
		Script_JScript = 3,
		
		[System.Runtime.Serialization.EnumMemberAttribute()]
		Data_XML = 4,
		
		[System.Runtime.Serialization.EnumMemberAttribute()]
		PNGformat = 5,
		
		[System.Runtime.Serialization.EnumMemberAttribute()]
		JPGformat = 6,
		
		[System.Runtime.Serialization.EnumMemberAttribute()]
		GIFformat = 7,
		
		[System.Runtime.Serialization.EnumMemberAttribute()]
		Silverlight_XAP = 8,
		
		[System.Runtime.Serialization.EnumMemberAttribute()]
		StyleSheet_XSL = 9,
		
		[System.Runtime.Serialization.EnumMemberAttribute()]
		ICOformat = 10,
		
		[System.Runtime.Serialization.EnumMemberAttribute()]
		Vectorformat_SVG = 11,
		
		[System.Runtime.Serialization.EnumMemberAttribute()]
		String_RESX = 12,
	}
	
	/// <summary>
	/// Data equivalent to files used in Web development. Web resources provide client-side components that are used to provide custom user interface elements.
	/// </summary>
	[System.Runtime.Serialization.DataContractAttribute()]
	[Microsoft.Xrm.Sdk.Client.EntityLogicalNameAttribute("webresource")]
	public partial class WebResource : Microsoft.Xrm.Sdk.Entity
	{
		
		/// <summary>
		/// Available fields, a the time of codegen, for the webresource entity
		/// </summary>
		public partial class Fields
		{
			public const string CanBeDeleted = "canbedeleted";
			public const string ComponentState = "componentstate";
			public const string Content = "content";
			public const string ContentFileRef = "contentfileref";
			public const string ContentJson = "contentjson";
			public const string ContentJsonFileRef = "contentjsonfileref";
			public const string CreatedBy = "createdby";
			public const string CreatedOn = "createdon";
			public const string CreatedOnBehalfBy = "createdonbehalfby";
			public const string DependencyXml = "dependencyxml";
			public const string Description = "description";
			public const string DisplayName = "displayname";
			public const string IntroducedVersion = "introducedversion";
			public const string IsAvailableForMobileOffline = "isavailableformobileoffline";
			public const string IsCustomizable = "iscustomizable";
			public const string IsEnabledForMobileClient = "isenabledformobileclient";
			public const string IsHidden = "ishidden";
			public const string IsManaged = "ismanaged";
			public const string LanguageCode = "languagecode";
			public const string ModifiedBy = "modifiedby";
			public const string ModifiedOn = "modifiedon";
			public const string ModifiedOnBehalfBy = "modifiedonbehalfby";
			public const string Name = "name";
			public const string OrganizationId = "organizationid";
			public const string OverwriteTime = "overwritetime";
			public const string SilverlightVersion = "silverlightversion";
			public const string SolutionId = "solutionid";
			public const string VersionNumber = "versionnumber";
			public const string WebResourceId = "webresourceid";
			public const string Id = "webresourceid";
			public const string WebResourceIdUnique = "webresourceidunique";
			public const string WebResourceType = "webresourcetype";
			public const string lk_webresourcebase_createdonbehalfby = "lk_webresourcebase_createdonbehalfby";
			public const string lk_webresourcebase_modifiedonbehalfby = "lk_webresourcebase_modifiedonbehalfby";
			public const string webresource_createdby = "webresource_createdby";
			public const string webresource_modifiedby = "webresource_modifiedby";
			public const string webresource_organization = "webresource_organization";
		}
		
		/// <summary>
		/// Default Constructor.
		/// </summary>
		public WebResource() : 
				base(EntityLogicalName)
		{
		}
		
		public const string EntityLogicalName = "webresource";
		
		public const string EntityLogicalCollectionName = "webresources";
		
		public const string EntitySetName = "webresourceset";
		
		/// <summary>
		/// Information that specifies whether this component can be deleted.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("canbedeleted")]
		public Microsoft.Xrm.Sdk.BooleanManagedProperty CanBeDeleted
		{
			get
			{
				return this.GetAttributeValue<Microsoft.Xrm.Sdk.BooleanManagedProperty>("canbedeleted");
			}
			set
			{
				this.SetAttributeValue("canbedeleted", value);
			}
		}
		
		/// <summary>
		/// For internal use only.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("componentstate")]
		public virtual componentstate? ComponentState
		{
			get
			{
				return ((componentstate?)(EntityOptionSetEnum.GetEnum(this, "componentstate")));
			}
		}
		
		/// <summary>
		/// Bytes of the web resource, in Base64 format.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("content")]
		public string Content
		{
			get
			{
				return this.GetAttributeValue<string>("content");
			}
			set
			{
				this.SetAttributeValue("content", value);
			}
		}
		
		/// <summary>
		/// Reference to the content file on Azure.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("contentfileref")]
		public object ContentFileRef
		{
			get
			{
				return this.GetAttributeValue<object>("contentfileref");
			}
		}
		
		/// <summary>
		/// Json representation of the content of the resource.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("contentjson")]
		public string ContentJson
		{
			get
			{
				return this.GetAttributeValue<string>("contentjson");
			}
			set
			{
				this.SetAttributeValue("contentjson", value);
			}
		}
		
		/// <summary>
		/// Reference to the Json content file on Azure.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("contentjsonfileref")]
		public object ContentJsonFileRef
		{
			get
			{
				return this.GetAttributeValue<object>("contentjsonfileref");
			}
		}
		
		/// <summary>
		/// Unique identifier of the user who created the web resource.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("createdby")]
		public Microsoft.Xrm.Sdk.EntityReference CreatedBy
		{
			get
			{
				return this.GetAttributeValue<Microsoft.Xrm.Sdk.EntityReference>("createdby");
			}
		}
		
		/// <summary>
		/// Date and time when the web resource was created.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("createdon")]
		public System.Nullable<System.DateTime> CreatedOn
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<System.DateTime>>("createdon");
			}
		}
		
		/// <summary>
		/// Unique identifier of the delegate user who created the web resource.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("createdonbehalfby")]
		public Microsoft.Xrm.Sdk.EntityReference CreatedOnBehalfBy
		{
			get
			{
				return this.GetAttributeValue<Microsoft.Xrm.Sdk.EntityReference>("createdonbehalfby");
			}
		}
		
		/// <summary>
		/// For internal use only.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("dependencyxml")]
		public string DependencyXml
		{
			get
			{
				return this.GetAttributeValue<string>("dependencyxml");
			}
			set
			{
				this.SetAttributeValue("dependencyxml", value);
			}
		}
		
		/// <summary>
		/// Description of the web resource.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("description")]
		public string Description
		{
			get
			{
				return this.GetAttributeValue<string>("description");
			}
			set
			{
				this.SetAttributeValue("description", value);
			}
		}
		
		/// <summary>
		/// Display name of the web resource.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("displayname")]
		public string DisplayName
		{
			get
			{
				return this.GetAttributeValue<string>("displayname");
			}
			set
			{
				this.SetAttributeValue("displayname", value);
			}
		}
		
		/// <summary>
		/// Version in which the form is introduced.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("introducedversion")]
		public string IntroducedVersion
		{
			get
			{
				return this.GetAttributeValue<string>("introducedversion");
			}
			set
			{
				this.SetAttributeValue("introducedversion", value);
			}
		}
		
		/// <summary>
		/// Information that specifies whether this web resource is available for mobile client in offline mode.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("isavailableformobileoffline")]
		public System.Nullable<bool> IsAvailableForMobileOffline
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<bool>>("isavailableformobileoffline");
			}
			set
			{
				this.SetAttributeValue("isavailableformobileoffline", value);
			}
		}
		
		/// <summary>
		/// Information that specifies whether this component can be customized.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("iscustomizable")]
		public Microsoft.Xrm.Sdk.BooleanManagedProperty IsCustomizable
		{
			get
			{
				return this.GetAttributeValue<Microsoft.Xrm.Sdk.BooleanManagedProperty>("iscustomizable");
			}
			set
			{
				this.SetAttributeValue("iscustomizable", value);
			}
		}
		
		/// <summary>
		/// Information that specifies whether this web resource is enabled for mobile client.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("isenabledformobileclient")]
		public System.Nullable<bool> IsEnabledForMobileClient
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<bool>>("isenabledformobileclient");
			}
			set
			{
				this.SetAttributeValue("isenabledformobileclient", value);
			}
		}
		
		/// <summary>
		/// Information that specifies whether this component should be hidden.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("ishidden")]
		public Microsoft.Xrm.Sdk.BooleanManagedProperty IsHidden
		{
			get
			{
				return this.GetAttributeValue<Microsoft.Xrm.Sdk.BooleanManagedProperty>("ishidden");
			}
			set
			{
				this.SetAttributeValue("ishidden", value);
			}
		}
		
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("ismanaged")]
		public System.Nullable<bool> IsManaged
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<bool>>("ismanaged");
			}
		}
		
		/// <summary>
		/// Language of the web resource.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("languagecode")]
		public System.Nullable<int> LanguageCode
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<int>>("languagecode");
			}
			set
			{
				this.SetAttributeValue("languagecode", value);
			}
		}
		
		/// <summary>
		/// Unique identifier of the user who last modified the web resource.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("modifiedby")]
		public Microsoft.Xrm.Sdk.EntityReference ModifiedBy
		{
			get
			{
				return this.GetAttributeValue<Microsoft.Xrm.Sdk.EntityReference>("modifiedby");
			}
		}
		
		/// <summary>
		/// Date and time when the web resource was last modified.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("modifiedon")]
		public System.Nullable<System.DateTime> ModifiedOn
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<System.DateTime>>("modifiedon");
			}
		}
		
		/// <summary>
		/// Unique identifier of the delegate user who modified the web resource.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("modifiedonbehalfby")]
		public Microsoft.Xrm.Sdk.EntityReference ModifiedOnBehalfBy
		{
			get
			{
				return this.GetAttributeValue<Microsoft.Xrm.Sdk.EntityReference>("modifiedonbehalfby");
			}
		}
		
		/// <summary>
		/// Name of the web resource.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("name")]
		public string Name
		{
			get
			{
				return this.GetAttributeValue<string>("name");
			}
			set
			{
				this.SetAttributeValue("name", value);
			}
		}
		
		/// <summary>
		/// Unique identifier of the organization associated with the web resource.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("organizationid")]
		public Microsoft.Xrm.Sdk.EntityReference OrganizationId
		{
			get
			{
				return this.GetAttributeValue<Microsoft.Xrm.Sdk.EntityReference>("organizationid");
			}
		}
		
		/// <summary>
		/// For internal use only.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("overwritetime")]
		public System.Nullable<System.DateTime> OverwriteTime
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<System.DateTime>>("overwritetime");
			}
		}
		
		/// <summary>
		/// Silverlight runtime version number required by a silverlight web resource.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("silverlightversion")]
		public string SilverlightVersion
		{
			get
			{
				return this.GetAttributeValue<string>("silverlightversion");
			}
			set
			{
				this.SetAttributeValue("silverlightversion", value);
			}
		}
		
		/// <summary>
		/// Unique identifier of the associated solution.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("solutionid")]
		public System.Nullable<System.Guid> SolutionId
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<System.Guid>>("solutionid");
			}
		}
		
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("versionnumber")]
		public System.Nullable<long> VersionNumber
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<long>>("versionnumber");
			}
		}
		
		/// <summary>
		/// Unique identifier of the web resource.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("webresourceid")]
		public System.Nullable<System.Guid> WebResourceId
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<System.Guid>>("webresourceid");
			}
			set
			{
				this.SetAttributeValue("webresourceid", value);
				if (value.HasValue)
				{
					base.Id = value.Value;
				}
				else
				{
					base.Id = System.Guid.Empty;
				}
			}
		}
		
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("webresourceid")]
		public override System.Guid Id
		{
			get
			{
				return base.Id;
			}
			set
			{
				this.WebResourceId = value;
			}
		}
		
		/// <summary>
		/// For internal use only.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("webresourceidunique")]
		public System.Nullable<System.Guid> WebResourceIdUnique
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<System.Guid>>("webresourceidunique");
			}
		}
		
		/// <summary>
		/// Drop-down list for selecting the type of the web resource.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("webresourcetype")]
		public virtual webresource_webresourcetype? WebResourceType
		{
			get
			{
				return ((webresource_webresourcetype?)(EntityOptionSetEnum.GetEnum(this, "webresourcetype")));
			}
			set
			{
				this.SetAttributeValue("webresourcetype", value.HasValue ? new Microsoft.Xrm.Sdk.OptionSetValue((int)value) : null);
			}
		}
		
		/// <summary>
		/// N:1 lk_webresourcebase_createdonbehalfby
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("createdonbehalfby")]
		[Microsoft.Xrm.Sdk.RelationshipSchemaNameAttribute("lk_webresourcebase_createdonbehalfby")]
		public yopower_papps_grid_extensions.earlybound.SystemUser lk_webresourcebase_createdonbehalfby
		{
			get
			{
				return this.GetRelatedEntity<yopower_papps_grid_extensions.earlybound.SystemUser>("lk_webresourcebase_createdonbehalfby", null);
			}
		}
		
		/// <summary>
		/// N:1 lk_webresourcebase_modifiedonbehalfby
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("modifiedonbehalfby")]
		[Microsoft.Xrm.Sdk.RelationshipSchemaNameAttribute("lk_webresourcebase_modifiedonbehalfby")]
		public yopower_papps_grid_extensions.earlybound.SystemUser lk_webresourcebase_modifiedonbehalfby
		{
			get
			{
				return this.GetRelatedEntity<yopower_papps_grid_extensions.earlybound.SystemUser>("lk_webresourcebase_modifiedonbehalfby", null);
			}
		}
		
		/// <summary>
		/// N:1 webresource_createdby
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("createdby")]
		[Microsoft.Xrm.Sdk.RelationshipSchemaNameAttribute("webresource_createdby")]
		public yopower_papps_grid_extensions.earlybound.SystemUser webresource_createdby
		{
			get
			{
				return this.GetRelatedEntity<yopower_papps_grid_extensions.earlybound.SystemUser>("webresource_createdby", null);
			}
		}
		
		/// <summary>
		/// N:1 webresource_modifiedby
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("modifiedby")]
		[Microsoft.Xrm.Sdk.RelationshipSchemaNameAttribute("webresource_modifiedby")]
		public yopower_papps_grid_extensions.earlybound.SystemUser webresource_modifiedby
		{
			get
			{
				return this.GetRelatedEntity<yopower_papps_grid_extensions.earlybound.SystemUser>("webresource_modifiedby", null);
			}
		}
		
		/// <summary>
		/// N:1 webresource_organization
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("organizationid")]
		[Microsoft.Xrm.Sdk.RelationshipSchemaNameAttribute("webresource_organization")]
		public yopower_papps_grid_extensions.earlybound.Organization webresource_organization
		{
			get
			{
				return this.GetRelatedEntity<yopower_papps_grid_extensions.earlybound.Organization>("webresource_organization", null);
			}
		}
	}
}
#pragma warning restore CS1591
