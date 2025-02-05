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
	/// Status of the AppSetting
	/// </summary>
	[System.Runtime.Serialization.DataContractAttribute()]
	public enum appsetting_statecode
	{
		
		[System.Runtime.Serialization.EnumMemberAttribute()]
		Active = 0,
		
		[System.Runtime.Serialization.EnumMemberAttribute()]
		Inactive = 1,
	}
	
	/// <summary>
	/// Reason for the status of the AppSetting
	/// </summary>
	[System.Runtime.Serialization.DataContractAttribute()]
	public enum appsetting_statuscode
	{
		
		[System.Runtime.Serialization.EnumMemberAttribute()]
		Active = 1,
		
		[System.Runtime.Serialization.EnumMemberAttribute()]
		Inactive = 2,
	}
	
	/// <summary>
	/// Holds the value for the associated App Setting Definition.
	/// </summary>
	[System.Runtime.Serialization.DataContractAttribute()]
	[Microsoft.Xrm.Sdk.Client.EntityLogicalNameAttribute("appsetting")]
	public partial class AppSetting : Microsoft.Xrm.Sdk.Entity
	{
		
		/// <summary>
		/// Available fields, a the time of codegen, for the appsetting entity
		/// </summary>
		public partial class Fields
		{
			public const string AppSettingId = "appsettingid";
			public const string Id = "appsettingid";
			public const string ComponentIdUnique = "componentidunique";
			public const string ComponentState = "componentstate";
			public const string CreatedBy = "createdby";
			public const string CreatedOn = "createdon";
			public const string CreatedOnBehalfBy = "createdonbehalfby";
			public const string Description = "description";
			public const string DisplayName = "displayname";
			public const string ImportSequenceNumber = "importsequencenumber";
			public const string IsCustomizable = "iscustomizable";
			public const string IsManaged = "ismanaged";
			public const string ModifiedBy = "modifiedby";
			public const string ModifiedOn = "modifiedon";
			public const string ModifiedOnBehalfBy = "modifiedonbehalfby";
			public const string OrganizationId = "organizationid";
			public const string OverriddenCreatedOn = "overriddencreatedon";
			public const string OverwriteTime = "overwritetime";
			public const string ParentAppModuleId = "parentappmoduleid";
			public const string SettingDefinitionId = "settingdefinitionid";
			public const string SolutionId = "solutionid";
			public const string statecode = "statecode";
			public const string statuscode = "statuscode";
			public const string TimeZoneRuleVersionNumber = "timezoneruleversionnumber";
			public const string UniqueName = "uniquename";
			public const string UTCConversionTimeZoneCode = "utcconversiontimezonecode";
			public const string Value = "value";
			public const string VersionNumber = "versionnumber";
			public const string appmodule_appsetting_parentappmoduleid = "appmodule_appsetting_parentappmoduleid";
			public const string lk_appsetting_createdby = "lk_appsetting_createdby";
			public const string lk_appsetting_createdonbehalfby = "lk_appsetting_createdonbehalfby";
			public const string lk_appsetting_modifiedby = "lk_appsetting_modifiedby";
			public const string lk_appsetting_modifiedonbehalfby = "lk_appsetting_modifiedonbehalfby";
			public const string organization_appsetting = "organization_appsetting";
			public const string settingdefinition_appsetting_settingdefinitionid = "settingdefinition_appsetting_settingdefinitionid";
		}
		
		/// <summary>
		/// Default Constructor.
		/// </summary>
		public AppSetting() : 
				base(EntityLogicalName)
		{
		}
		
		public const string EntityLogicalName = "appsetting";
		
		public const string EntityLogicalCollectionName = "appsettings";
		
		public const string EntitySetName = "appsettings";
		
		/// <summary>
		/// Unique identifier for entity instances
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("appsettingid")]
		public System.Nullable<System.Guid> AppSettingId
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<System.Guid>>("appsettingid");
			}
			set
			{
				this.SetAttributeValue("appsettingid", value);
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
		
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("appsettingid")]
		public override System.Guid Id
		{
			get
			{
				return base.Id;
			}
			set
			{
				this.AppSettingId = value;
			}
		}
		
		/// <summary>
		/// For internal use only.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("componentidunique")]
		public System.Nullable<System.Guid> ComponentIdUnique
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<System.Guid>>("componentidunique");
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
		/// Unique identifier of the user who created the record.
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
		/// Date and time when the record was created.
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
		/// Unique identifier of the delegate user who created the record.
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
		/// The description of the App Setting.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("description")]
		public string Description
		{
			get
			{
				return this.GetAttributeValue<string>("description");
			}
		}
		
		/// <summary>
		/// Display name of the App Setting.
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
		/// Sequence number of the import that created this record.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("importsequencenumber")]
		public System.Nullable<int> ImportSequenceNumber
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<int>>("importsequencenumber");
			}
			set
			{
				this.SetAttributeValue("importsequencenumber", value);
			}
		}
		
		/// <summary>
		/// For internal use only.
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
		/// Indicates whether the solution component is part of a managed solution.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("ismanaged")]
		public System.Nullable<bool> IsManaged
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<bool>>("ismanaged");
			}
		}
		
		/// <summary>
		/// Unique identifier of the user who modified the record.
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
		/// Date and time when the record was modified.
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
		/// Unique identifier of the delegate user who modified the record.
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
		/// Unique identifier for the organization
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
		/// Date and time that the record was migrated.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("overriddencreatedon")]
		public System.Nullable<System.DateTime> OverriddenCreatedOn
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<System.DateTime>>("overriddencreatedon");
			}
			set
			{
				this.SetAttributeValue("overriddencreatedon", value);
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
		/// Unique identifier for AppModule associated with AppSetting.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("parentappmoduleid")]
		public Microsoft.Xrm.Sdk.EntityReference ParentAppModuleId
		{
			get
			{
				return this.GetAttributeValue<Microsoft.Xrm.Sdk.EntityReference>("parentappmoduleid");
			}
			set
			{
				this.SetAttributeValue("parentappmoduleid", value);
			}
		}
		
		/// <summary>
		/// Unique identifier for SettingDefinition associated with AppSetting.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("settingdefinitionid")]
		public Microsoft.Xrm.Sdk.EntityReference SettingDefinitionId
		{
			get
			{
				return this.GetAttributeValue<Microsoft.Xrm.Sdk.EntityReference>("settingdefinitionid");
			}
			set
			{
				this.SetAttributeValue("settingdefinitionid", value);
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
		
		/// <summary>
		/// Status of the AppSetting
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("statecode")]
		public virtual appsetting_statecode? statecode
		{
			get
			{
				return ((appsetting_statecode?)(EntityOptionSetEnum.GetEnum(this, "statecode")));
			}
		}
		
		/// <summary>
		/// Reason for the status of the AppSetting
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("statuscode")]
		public virtual appsetting_statuscode? statuscode
		{
			get
			{
				return ((appsetting_statuscode?)(EntityOptionSetEnum.GetEnum(this, "statuscode")));
			}
		}
		
		/// <summary>
		/// For internal use only.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("timezoneruleversionnumber")]
		public System.Nullable<int> TimeZoneRuleVersionNumber
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<int>>("timezoneruleversionnumber");
			}
			set
			{
				this.SetAttributeValue("timezoneruleversionnumber", value);
			}
		}
		
		/// <summary>
		/// Unique name of the App Setting.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("uniquename")]
		public string UniqueName
		{
			get
			{
				return this.GetAttributeValue<string>("uniquename");
			}
			set
			{
				this.SetAttributeValue("uniquename", value);
			}
		}
		
		/// <summary>
		/// Time zone code that was in use when the record was created.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("utcconversiontimezonecode")]
		public System.Nullable<int> UTCConversionTimeZoneCode
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<int>>("utcconversiontimezonecode");
			}
			set
			{
				this.SetAttributeValue("utcconversiontimezonecode", value);
			}
		}
		
		/// <summary>
		/// Contains the actual value of app settings.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("value")]
		public string Value
		{
			get
			{
				return this.GetAttributeValue<string>("value");
			}
			set
			{
				this.SetAttributeValue("value", value);
			}
		}
		
		/// <summary>
		/// Version Number
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("versionnumber")]
		public System.Nullable<long> VersionNumber
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<long>>("versionnumber");
			}
		}
		
		/// <summary>
		/// N:1 appmodule_appsetting_parentappmoduleid
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("parentappmoduleid")]
		[Microsoft.Xrm.Sdk.RelationshipSchemaNameAttribute("appmodule_appsetting_parentappmoduleid")]
		public yopower_papps_grid_extensions.earlybound.AppModule appmodule_appsetting_parentappmoduleid
		{
			get
			{
				return this.GetRelatedEntity<yopower_papps_grid_extensions.earlybound.AppModule>("appmodule_appsetting_parentappmoduleid", null);
			}
			set
			{
				this.SetRelatedEntity<yopower_papps_grid_extensions.earlybound.AppModule>("appmodule_appsetting_parentappmoduleid", null, value);
			}
		}
		
		/// <summary>
		/// N:1 lk_appsetting_createdby
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("createdby")]
		[Microsoft.Xrm.Sdk.RelationshipSchemaNameAttribute("lk_appsetting_createdby")]
		public yopower_papps_grid_extensions.earlybound.SystemUser lk_appsetting_createdby
		{
			get
			{
				return this.GetRelatedEntity<yopower_papps_grid_extensions.earlybound.SystemUser>("lk_appsetting_createdby", null);
			}
		}
		
		/// <summary>
		/// N:1 lk_appsetting_createdonbehalfby
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("createdonbehalfby")]
		[Microsoft.Xrm.Sdk.RelationshipSchemaNameAttribute("lk_appsetting_createdonbehalfby")]
		public yopower_papps_grid_extensions.earlybound.SystemUser lk_appsetting_createdonbehalfby
		{
			get
			{
				return this.GetRelatedEntity<yopower_papps_grid_extensions.earlybound.SystemUser>("lk_appsetting_createdonbehalfby", null);
			}
		}
		
		/// <summary>
		/// N:1 lk_appsetting_modifiedby
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("modifiedby")]
		[Microsoft.Xrm.Sdk.RelationshipSchemaNameAttribute("lk_appsetting_modifiedby")]
		public yopower_papps_grid_extensions.earlybound.SystemUser lk_appsetting_modifiedby
		{
			get
			{
				return this.GetRelatedEntity<yopower_papps_grid_extensions.earlybound.SystemUser>("lk_appsetting_modifiedby", null);
			}
		}
		
		/// <summary>
		/// N:1 lk_appsetting_modifiedonbehalfby
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("modifiedonbehalfby")]
		[Microsoft.Xrm.Sdk.RelationshipSchemaNameAttribute("lk_appsetting_modifiedonbehalfby")]
		public yopower_papps_grid_extensions.earlybound.SystemUser lk_appsetting_modifiedonbehalfby
		{
			get
			{
				return this.GetRelatedEntity<yopower_papps_grid_extensions.earlybound.SystemUser>("lk_appsetting_modifiedonbehalfby", null);
			}
		}
		
		/// <summary>
		/// N:1 organization_appsetting
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("organizationid")]
		[Microsoft.Xrm.Sdk.RelationshipSchemaNameAttribute("organization_appsetting")]
		public yopower_papps_grid_extensions.earlybound.Organization organization_appsetting
		{
			get
			{
				return this.GetRelatedEntity<yopower_papps_grid_extensions.earlybound.Organization>("organization_appsetting", null);
			}
		}
		
		/// <summary>
		/// N:1 settingdefinition_appsetting_settingdefinitionid
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("settingdefinitionid")]
		[Microsoft.Xrm.Sdk.RelationshipSchemaNameAttribute("settingdefinition_appsetting_settingdefinitionid")]
		public yopower_papps_grid_extensions.earlybound.SettingDefinition settingdefinition_appsetting_settingdefinitionid
		{
			get
			{
				return this.GetRelatedEntity<yopower_papps_grid_extensions.earlybound.SettingDefinition>("settingdefinition_appsetting_settingdefinitionid", null);
			}
			set
			{
				this.SetRelatedEntity<yopower_papps_grid_extensions.earlybound.SettingDefinition>("settingdefinition_appsetting_settingdefinitionid", null, value);
			}
		}
	}
}
#pragma warning restore CS1591
