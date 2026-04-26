import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { Icon, ProgressIndicator } from "@fluentui/react";
import { RuleCondition } from "../models/common/RuleColor";
import { GetRendererParams } from "../types";

export function getNumbersProgressBar(cell: ICell): React.ReactElement | null | undefined {
    const type = JSON.parse(cell.definition.parameters).type as string;
    const rules = JSON.parse(cell.definition.parameters).rules as Array<any>;
    let ownValue: number | null = null;
    if (cell.col.dataType === "Decimal"
        || cell.col.dataType === "Integer"
        || cell.col.dataType === "FloatingPoint") {
        ownValue = cell.props.value;
        const rowData = (cell.params as GetRendererParams).rowData;
        const rule = rules.find(r => {
            const group = r.group ?? "or";
            const results = r.conditions.map((condition: RuleCondition) => {
                let value: number | null;
                if (condition.column == cell.col.name) {
                    value = ownValue;
                } else {
                    const colKey = Object.keys(rowData!).find(k => k.includes(condition.column!));
                    const raw = colKey ? (rowData as any)[colKey] : null;
                    if (raw !== null && raw !== undefined && !isNaN(Number(raw)))
                        value = Number(raw);
                    else
                        value = null;
                }
                if (condition.criteria === null || condition.criteria === undefined || condition.criteria === 'range')
                    return value !== null && condition.min! <= value && condition.max! >= value;
                if (condition.criteria === 'is-null')
                    return value === null;
                if (condition.criteria === 'is-not-null')
                    return value !== null;
                return false;
            });
            return group === "and" ? results.every(Boolean) : results.some(Boolean);
        }) ?? null;

        if (rule !== null) {
            if (ownValue !== null && ownValue !== undefined) {
                if (type === "*") ownValue = ownValue * 100;
                else if (type === "/") ownValue = ownValue / 100;
            }
            const background = rule.output.background ?? "transparent";
            const color = rule.output.color ?? "transparent";
            return (
                <div
                    title={rule.output.label ?? ""}
                    style={{
                        borderRadius: 2,
                        textAlign: "center",
                        lineHeight: "20px",
                        display: "flex"
                    }}
                    onKeyDown={(e) => { cell.definition.settings.editable ? cell.props.startEditing() : e.preventDefault() }}
                    onClick={(e) => { cell.definition.settings.editable ? cell.props.startEditing() : e.preventDefault() }}>
                    <Icon iconName={rule.output.icon} styles={{ root: { color: background, marginRight: 3 } }} />
                    <ProgressIndicator
                        description={cell.props.formattedValue ?? ""}
                        percentComplete={ownValue ?? 0}
                        styles={
                            {
                                root:
                                {
                                    width: "100%"
                                },
                                progressBar: {
                                    background: background,
                                    height: "5px"
                                },
                                progressTrack: {
                                    height: "5px"
                                },
                                itemDescription: {
                                    color: color,
                                    textAlign: "center"
                                }
                            }
                        } />
                </div>
            );
        }
    }
}