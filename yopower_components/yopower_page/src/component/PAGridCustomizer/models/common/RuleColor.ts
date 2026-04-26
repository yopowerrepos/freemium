export interface RuleCondition {
    column?: string | null;  // null → use cell.props.value (own cell)
    criteria: string | null; // is-null, is-not-null, range
    min?: number;
    max?: number;
}

export interface RuleColorOutput {
    background: string;
    color: string;
    icon?: string;
    label?: string;
}

export interface RuleColor {
    group?: "or" | "and"; // default "or"
    conditions: RuleCondition[];
    output: RuleColorOutput;
}
