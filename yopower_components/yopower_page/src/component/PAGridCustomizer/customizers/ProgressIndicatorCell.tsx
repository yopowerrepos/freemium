import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { ProgressIndicator } from "@fluentui/react";

export function gerProgressBarCell(cell: ICell): React.ReactElement | null | undefined {
    const type = JSON.parse(cell.definition.parameters).type as string;
    const rules = JSON.parse(cell.definition.parameters).rules as Array<any>;
    if (cell.col.dataType === "Decimal"
        || cell.col.dataType === "Integer"
        || cell.col.dataType === "FloatingPoint") {
        let value: number = 0;
        if (cell.props.value !== null && cell.props.value !== undefined) {
            value = cell.props.value as number;
            const rule = rules.find(r => r.min <= value! && r.max >= value!) ?? null;
            if (rule !== null && value !== null) {
                if (type === "*") value = value * 100;
                else if (type === "/") value = value / 100;
                const background = rule.background ?? "black";
                const color = rule.color ?? "black";
                return (
                    <div
                        title={rule.label!}
                        style={{
                            padding: 3,
                            borderRadius: 5,
                            textAlign: "left"
                        }}
                        onKeyDown={(e) => { cell.definition.settings.editable ? cell.props.startEditing() : e.preventDefault() }}
                        onClick={(e) => { cell.definition.settings.editable ? cell.props.startEditing() : e.preventDefault() }}>
                        <ProgressIndicator
                            description={cell.props.formattedValue}
                            percentComplete={value}
                            styles={
                                {
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
}