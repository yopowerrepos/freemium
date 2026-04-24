export interface RuleColor {
    criteria: string | null; // null or equals, is-null, is-not-null
    min: number;
    max: number;
    background: string;
    color: string;
    icon?: string;
    label?: string;
}