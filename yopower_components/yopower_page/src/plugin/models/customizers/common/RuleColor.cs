using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace yopower_papps_grid_extensions.models.customizers.common
{
    [DataContract]
    public class RuleCondition
    {
        [DataMember(Name = "column", Order = 1, IsRequired = false)] public string Column { get; set; }
        [DataMember(Name = "criteria", Order = 2, IsRequired = false)] public string Criteria { get; set; }
        [DataMember(Name = "min", Order = 3, IsRequired = false)] public decimal? Min { get; set; }
        [DataMember(Name = "max", Order = 4, IsRequired = false)] public decimal? Max { get; set; }
    }

    [DataContract]
    public class RuleColorOutput
    {
        [DataMember(Name = "background", Order = 1, IsRequired = true)] public string Background { get; set; }
        [DataMember(Name = "color", Order = 2, IsRequired = true)] public string Color { get; set; }
        [DataMember(Name = "icon", Order = 3, IsRequired = false)] public string Icon { get; set; }
        [DataMember(Name = "label", Order = 4, IsRequired = false)] public string Label { get; set; }
    }

    [DataContract]
    public class RuleColor
    {
        [DataMember(Name = "group", Order = 1, IsRequired = false)] public string Group { get; set; }
        [DataMember(Name = "conditions", Order = 2, IsRequired = true)] public List<RuleCondition> Conditions { get; set; }
        [DataMember(Name = "output", Order = 3, IsRequired = true)] public RuleColorOutput Output { get; set; }

        /// <summary>
        /// Validates the Group property
        /// </summary>
        /// <exception cref="InvalidOperationException">Thrown when group is invalid</exception>
        private void ValidateGroup()
        {
            if (!string.IsNullOrWhiteSpace(this.Group))
            {
                var lowerGroup = this.Group.ToLower();
                if (lowerGroup != "and" && lowerGroup != "or")
                    throw new InvalidOperationException($"❌Group must be 'and' or 'or', but found '{this.Group}'.");
            }
        }

        /// <summary>
        /// Validates all conditions in the rule against the expected column logical name
        /// </summary>
        /// <param name="expectedColumnLogicalName">The logical name that all conditions must reference</param>
        /// <exception cref="InvalidOperationException">Thrown when validation fails</exception>
        public void ValidateConditions(string expectedColumnLogicalName)
        {
            ValidateGroup();

            if (this.Conditions == null || this.Conditions.Count == 0)
                throw new InvalidOperationException("❌Rule must have at least one condition.");

            foreach (var condition in this.Conditions)
            {
                // Validate that Column matches expectedColumnLogicalName
                if (condition.Column != expectedColumnLogicalName)
                    throw new InvalidOperationException($"❌Condition column must be '{expectedColumnLogicalName}', but found '{condition.Column ?? "null"}'.");

                // Validate Criteria is not null or empty
                if (string.IsNullOrWhiteSpace(condition.Criteria))
                    throw new InvalidOperationException("❌Condition criteria cannot be null or empty.");

                // Validate based on criteria type
                switch (condition.Criteria.ToLower())
                {
                    case "range":
                        if (!condition.Min.HasValue || !condition.Max.HasValue)
                            throw new InvalidOperationException("❌Condition with criteria 'range' must have both 'min' and 'max' values.");
                        if (condition.Max.Value < condition.Min.Value)
                            throw new InvalidOperationException($"❌Condition 'max' ({condition.Max.Value}) must be equal to or higher than 'min' ({condition.Min.Value}).");
                        break;

                    case "is-null":
                    case "is-not-null":
                        if (condition.Min.HasValue || condition.Max.HasValue)
                            throw new InvalidOperationException($"❌Condition with criteria '{condition.Criteria}' must not have 'min' or 'max' values.");
                        break;

                    default:
                        throw new InvalidOperationException($"❌Unknown criteria '{condition.Criteria}'. Valid values are: 'range', 'is-null', 'is-not-null'.");
                }
            }
        }

        /// <summary>
        /// Validates that all conditions reference the expected column logical name only
        /// </summary>
        /// <param name="expectedColumnLogicalName">The logical name that all conditions must reference</param>
        /// <exception cref="InvalidOperationException">Thrown when validation fails</exception>
        public void ValidateColumnOnly(string expectedColumnLogicalName)
        {
            ValidateGroup();

            if (this.Conditions == null || this.Conditions.Count == 0)
                throw new InvalidOperationException("❌Rule must have at least one condition.");

            foreach (var condition in this.Conditions)
            {
                // Validate that Column matches expectedColumnLogicalName
                if (condition.Column != expectedColumnLogicalName)
                    throw new InvalidOperationException($"❌Condition column must be '{expectedColumnLogicalName}', but found '{condition.Column ?? "null"}'.");
            }
        }

        /// <summary>
        /// Validates criteria rules without checking the column logical name (allows any column)
        /// </summary>
        /// <exception cref="InvalidOperationException">Thrown when validation fails</exception>
        public void ValidateCriteriaOnly()
        {
            ValidateGroup();

            if (this.Conditions == null || this.Conditions.Count == 0)
                throw new InvalidOperationException("❌Rule must have at least one condition.");

            foreach (var condition in this.Conditions)
            {
                // Validate Criteria is not null or empty
                if (string.IsNullOrWhiteSpace(condition.Criteria))
                    throw new InvalidOperationException("❌Condition criteria cannot be null or empty.");

                // Validate based on criteria type
                switch (condition.Criteria.ToLower())
                {
                    case "range":
                        if (!condition.Min.HasValue || !condition.Max.HasValue)
                            throw new InvalidOperationException("❌Condition with criteria 'range' must have both 'min' and 'max' values.");
                        if (condition.Max.Value < condition.Min.Value)
                            throw new InvalidOperationException($"❌Condition 'max' ({condition.Max.Value}) must be equal to or higher than 'min' ({condition.Min.Value}).");
                        break;

                    case "is-null":
                    case "is-not-null":
                        if (condition.Min.HasValue || condition.Max.HasValue)
                            throw new InvalidOperationException($"❌Condition with criteria '{condition.Criteria}' must not have 'min' or 'max' values.");
                        break;

                    default:
                        throw new InvalidOperationException($"❌Unknown criteria '{condition.Criteria}'. Valid values are: 'range', 'is-null', 'is-not-null'.");
                }
            }
        }
    }
}
