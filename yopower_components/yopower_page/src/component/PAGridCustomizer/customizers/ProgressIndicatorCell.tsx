import * as React from "react";
import { ColumnDefinition, GetRendererParams } from "../types";
import { ProgressIndicator } from "@fluentui/react";
import { IInputs } from "../generated/ManifestTypes";

export function gerProgressBarCell(
    context: ComponentFramework.Context<IInputs>,
    render: GetRendererParams,
    col: ColumnDefinition,
    props: any,
    definition: any,
    table: string,
    id: string,
    goToSettings: (e: any) => void
): React.ReactElement | null | undefined {
    const type = JSON.parse(definition.parameters).type as string;
    const rules = JSON.parse(definition.parameters).rules as Array<any>;
    if (col.dataType === "Decimal"
        || col.dataType === "Integer"
        || col.dataType === "FloatingPoint") {
        let value: number = 0;
        if (props.value !== null && props.value !== undefined) {
            value = props.value as number;
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
                        onKeyDown={(e) => { definition.settings.editable ? props.startEditing() : e.preventDefault() }}
                        onClick={(e) => { definition.settings.editable ? props.startEditing() : e.preventDefault() }}
                        onMouseDown={(e) => { goToSettings(e) }} >
                        <ProgressIndicator
                            description={props.formattedValue}
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