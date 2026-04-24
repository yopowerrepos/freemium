import { RuleColor } from "../common/RuleColor";

export interface _902AnyRelatedRecords {
    reference: string;
    viewId: string;
    viewName: string;
    column: string;
    table: string;
    rules: RuleColor[];
    fetchXmlAggregate: string;
    fetchXml: string;
    layoutXml: string;
}