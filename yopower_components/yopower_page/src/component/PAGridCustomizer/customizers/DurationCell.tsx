import * as React from "react";
import { ColumnDefinition, GetEditorParams } from "../types";
import { IInputs } from "../generated/ManifestTypes";
import { ISpinButtonStyles, SpinButton } from "@fluentui/react/lib/SpinButton";
import { Icon } from "@fluentui/react/lib/components/Icon/Icon";

const styles: Partial<ISpinButtonStyles> = { spinButtonWrapper: { width: 50, flex: 1 } };

interface DurationCellProps {
    context: ComponentFramework.Context<IInputs>,
    editor: GetEditorParams,
    col: ColumnDefinition,
    props: any,
    definition: any,
    table: string,
    id: string
}

export const DurationCell: React.FC<DurationCellProps> = ({
    context,
    editor,
    col,
    props,
    definition,
    table,
    id
}) => {
    if (col.dataType === "Duration") {
        const params = JSON.parse(definition.parameters);

        const [duration, setDuration] = React.useState<number>(0);

        return (
            <div
                style={{
                    padding: "4px 8px",
                    borderRadius: 2,
                    textAlign: "center",
                    lineHeight: "20px",
                    display: "flex",
                    margin: "4px",
                    gap: 6,
                    alignItems: "center",
                    justifyContent: "center"
                }}
                tabIndex={-1}>
                <SpinButton
                    defaultValue={(props.value / 60).toString()}
                    min={params.min}
                    max={params.max}
                    step={params.step}
                    styles={styles}
                    onValidate={getValidateHandler(params.min, params.max)}
                    onChange={
                        (e, value) => {
                            const value_ = getNumericPart(value!) ?? 0;
                            const minutes = value_ !== null ? value_ * 60 : null;
                            setDuration(minutes!);
                            editor.onCellValueChanged(minutes);
                        }
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            editor.onCellValueChanged(duration);
                            editor.stopEditing();
                        }
                    }}
                    onBlur={(e) => handleBlur(e, editor)}
                />
            </div>
        );
    }
    else
        return null;
}

const getValidateHandler = (min: number, max: number) => (
    value: string,
    event?: React.SyntheticEvent<HTMLElement>
): string | void => {
    let numericValue = getNumericPart(value);
    if (numericValue !== undefined) {
        numericValue = Math.min(numericValue, max);
        numericValue = Math.max(numericValue, min);
        return String(numericValue);
    }
};

export function getNumericPart(value: string): number | undefined {
    const valueRegex = /^(\d+(\.\d+)?).*/;
    if (valueRegex.test(value)) {
        const numericValue = Number(value.replace(valueRegex, "$1"));
        return isNaN(numericValue) ? undefined : numericValue;
    }
    return undefined;
}

export function handleBlur(e: React.FocusEvent, editor: GetEditorParams): void {
    editor.stopEditing();
};