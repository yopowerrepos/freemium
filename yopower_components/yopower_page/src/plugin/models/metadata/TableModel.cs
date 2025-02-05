using Microsoft.Xrm.Sdk.Metadata;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace yopower_papps_grid_extensions.models.metadata
{
    [DataContract]
    public class TableModel
    {
        public TableModel(EntityMetadata entityMetadata)
        {
            DisplayName = entityMetadata.DisplayName.UserLocalizedLabel != null ? entityMetadata.DisplayName.UserLocalizedLabel.Label : string.Empty;
            DisplayCollectionName = entityMetadata.DisplayCollectionName.UserLocalizedLabel != null ? entityMetadata.DisplayCollectionName.UserLocalizedLabel.Label : string.Empty;
            LogicalName = entityMetadata.LogicalName;
            CollectionLogicalName = entityMetadata.LogicalCollectionName;
            SchemaName = entityMetadata.SchemaName;
            CollectionSchemaName = entityMetadata.CollectionSchemaName;
            PrimaryIdAttribute = entityMetadata.PrimaryIdAttribute;
            PrimaryNameAttribute = entityMetadata.PrimaryNameAttribute;
            ObjectTypeCode = entityMetadata.ObjectTypeCode;
            TableType = entityMetadata.TableType;
            IsCustom = entityMetadata.IsCustomEntity != null ? entityMetadata.IsCustomEntity.Value : false;
            if (entityMetadata.Attributes != null)
                Columns = entityMetadata.Attributes.Select(s => GetFormat(s)).ToList();
            else
                Columns = new List<ColumnModel>();
        }

        private ColumnModel GetFormat(AttributeMetadata attribute)
        {
            var column = new ColumnModel();
            column.DisplayName = attribute.DisplayName.UserLocalizedLabel != null ? attribute.DisplayName.UserLocalizedLabel.Label : string.Empty;
            column.LogicalName = attribute.LogicalName;
            column.IsCustom = attribute.IsCustomAttribute != null ? attribute.IsCustomAttribute.Value : false;
            column.Type = new OptionSetModel()
            {
                DisplayName = attribute.ToString(),
                Value = attribute.AttributeType.GetHashCode(),
            };

            switch (attribute.AttributeType)
            {
                case AttributeTypeCode.Boolean:
                    var boolean_ = (BooleanAttributeMetadata)attribute;
                    column.Format = null;
                    column.Options = new List<OptionSetModel>();
                    column.Options.Add(new OptionSetModel()
                    {
                        DisplayName = boolean_.OptionSet.TrueOption.Label.UserLocalizedLabel.Label,
                        Value = boolean_.OptionSet.TrueOption.Value.Value,
                        Color = boolean_.OptionSet.TrueOption.Color
                    });
                    column.Options.Add(new OptionSetModel()
                    {
                        DisplayName = boolean_.OptionSet.FalseOption.Label.UserLocalizedLabel.Label,
                        Value = boolean_.OptionSet.FalseOption.Value.Value,
                        Color = boolean_.OptionSet.FalseOption.Color
                    });
                    break;

                case AttributeTypeCode.DateTime:
                    var datetime = (DateTimeAttributeMetadata)attribute;
                    column.Format = new OptionSetModel()
                    {
                        DisplayName = datetime.Format.ToString(),
                        Value = datetime.Format.GetHashCode(),
                    };
                    break;

                case AttributeTypeCode.Integer:
                    var integer_ = (IntegerAttributeMetadata)attribute;
                    column.Format = new OptionSetModel()
                    {
                        DisplayName = integer_.Format.ToString(),
                        Value = integer_.Format.GetHashCode(),
                    };
                    column.Options = null;
                    break;

                case AttributeTypeCode.Memo:
                    var memo_ = (MemoAttributeMetadata)attribute;
                    column.Format = new OptionSetModel()
                    {
                        DisplayName = memo_.Format.ToString(),
                        Value = memo_.Format.GetHashCode(),
                    };
                    column.Options = null;
                    break;

                case AttributeTypeCode.String:
                    var string_ = (StringAttributeMetadata)attribute;
                    column.Format = new OptionSetModel()
                    {
                        DisplayName = string_.Format.ToString(),
                        Value = string_.Format.GetHashCode(),
                    };
                    column.Options = null;
                    break;

                case AttributeTypeCode.Picklist:
                    var picklist_ = (PicklistAttributeMetadata)attribute;
                    column.Format = null;
                    column.Options = picklist_.OptionSet.Options.Select(s => new OptionSetModel()
                    {
                        DisplayName = s.Label.UserLocalizedLabel.Label,
                        Value = s.Value.Value,
                        Color = s.Color
                    }).ToList();
                    break;

                case AttributeTypeCode.Status:
                    var status_ = (StatusAttributeMetadata)attribute;
                    column.Format = null;
                    column.Options = status_.OptionSet.Options.Select(s => new OptionSetModel()
                    {
                        DisplayName = s.Label.UserLocalizedLabel.Label,
                        Value = s.Value.Value,
                        Color = s.Color
                    }).ToList();
                    break;

                case AttributeTypeCode.State:
                    var states_ = (StateAttributeMetadata)attribute;
                    column.Format = null;
                    column.Options = states_.OptionSet.Options.Select(s => new OptionSetModel()
                    {
                        DisplayName = s.Label.UserLocalizedLabel.Label,
                        Value = s.Value.Value,
                        Color = s.Color
                    }).ToList();
                    break;

                case AttributeTypeCode.ManagedProperty:
                    var managed_ = (ManagedPropertyAttributeMetadata)attribute;
                    column.Format = null;
                    column.Options = null;
                    break;

                default:
                    column.Format = null;
                    column.Options = null;
                    break;
            }

            return column;
        }

        [DataMember(Name = "displayname", Order = 1)]
        public string DisplayName { get; set; }

        [DataMember(Name = "displaycollectionname", Order = 1)]
        public string DisplayCollectionName { get; set; }

        [DataMember(Name = "logicalname", Order = 3)]
        public string LogicalName { get; set; }

        [DataMember(Name = "collectionlogicalname", Order = 4)]
        public string CollectionLogicalName { get; set; }

        [DataMember(Name = "schemaname", Order = 5)]
        public string SchemaName { get; set; }

        [DataMember(Name = "collectionschemaname", Order = 6)]
        public string CollectionSchemaName { get; set; }

        [DataMember(Name = "primaryidattribute", Order = 7)]
        public string PrimaryIdAttribute { get; set; }

        [DataMember(Name = "primarynameattribute", Order = 8)]
        public string PrimaryNameAttribute { get; set; }

        [DataMember(Name = "objecttypecode", Order = 9)]
        public int? ObjectTypeCode { get; set; }

        [DataMember(Name = "tabletype", Order = 10)]
        public string TableType { get; set; }

        [DataMember(Name = "iscustom", Order = 11)]
        public bool IsCustom { get; set; }

        public List<ColumnModel> Columns { get; set; }
    }
}
