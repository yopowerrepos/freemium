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
	
	
	[System.Runtime.Serialization.DataContractAttribute()]
	[Microsoft.Xrm.Sdk.Client.EntityLogicalNameAttribute("systemuserroles")]
	public partial class SystemUserRoles : Microsoft.Xrm.Sdk.Entity
	{
		
		/// <summary>
		/// Available fields, a the time of codegen, for the systemuserroles entity
		/// </summary>
		public partial class Fields
		{
			public const string RoleId = "roleid";
			public const string SystemUserId = "systemuserid";
			public const string SystemUserRoleId = "systemuserroleid";
			public const string Id = "systemuserroleid";
			public const string VersionNumber = "versionnumber";
			public const string systemuserroles_association = "systemuserroles_association";
		}
		
		/// <summary>
		/// Default Constructor.
		/// </summary>
		public SystemUserRoles() : 
				base(EntityLogicalName)
		{
		}
		
		public const string EntityLogicalName = "systemuserroles";
		
		public const string EntityLogicalCollectionName = null;
		
		public const string EntitySetName = "systemuserrolescollection";
		
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("roleid")]
		public System.Nullable<System.Guid> RoleId
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<System.Guid>>("roleid");
			}
		}
		
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("systemuserid")]
		public System.Nullable<System.Guid> SystemUserId
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<System.Guid>>("systemuserid");
			}
		}
		
		/// <summary>
		/// For internal use only.
		/// </summary>
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("systemuserroleid")]
		public System.Nullable<System.Guid> SystemUserRoleId
		{
			get
			{
				return this.GetAttributeValue<System.Nullable<System.Guid>>("systemuserroleid");
			}
			set
			{
				this.SetAttributeValue("systemuserroleid", value);
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
		
		[Microsoft.Xrm.Sdk.AttributeLogicalNameAttribute("systemuserroleid")]
		public override System.Guid Id
		{
			get
			{
				return base.Id;
			}
			set
			{
				this.SystemUserRoleId = value;
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
		/// N:N systemuserroles_association
		/// </summary>
		[Microsoft.Xrm.Sdk.RelationshipSchemaNameAttribute("systemuserroles_association")]
		public System.Collections.Generic.IEnumerable<yopower_papps_grid_extensions.earlybound.SystemUser> systemuserroles_association
		{
			get
			{
				return this.GetRelatedEntities<yopower_papps_grid_extensions.earlybound.SystemUser>("systemuserroles_association", null);
			}
			set
			{
				this.SetRelatedEntities<yopower_papps_grid_extensions.earlybound.SystemUser>("systemuserroles_association", null, value);
			}
		}
	}
}
#pragma warning restore CS1591
