import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { ISpinButtonStyles, SpinButton } from "@fluentui/react/lib/SpinButton";
import { GetEditorParams } from "../types";
import { _702NumbersDuration } from "../models/customizers/_702NumbersDuration";

const styles: Partial<ISpinButtonStyles> = { spinButtonWrapper: { width: 50, flex: 1 } };

export const NumbersDuration: React.FC<ICell> = (cell) => {
    if (cell.col.dataType === "Duration") {
        const params = JSON.parse(cell.definition.parameters) as _702NumbersDuration;

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
                    defaultValue={(cell.props.value / 60).toString()}
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
                            (cell.params as GetEditorParams).onCellValueChanged(minutes);
                        }
                    }
                    onKeyDownCapture={(e) => {
                        if (e.key === "Enter") {
                            const value_ = getNumericPart((e.target as HTMLInputElement).value) ?? 0;
                            const minutes = value_ !== null ? value_ * 60 : null;
                            setDuration(minutes!);
                            (cell.params as GetEditorParams).onCellValueChanged(minutes);
                            (cell.params as GetEditorParams).stopEditing();
                        }
                    }}
                    onBlur={(e) => handleBlur(e, cell.params as GetEditorParams)}
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
    const normalizedValue = value.replace(',', '.');
    const valueRegex = /^(\d+(\.\d+)?).*/;
    if (valueRegex.test(normalizedValue)) {
        const numericValue = Number(normalizedValue.replace(valueRegex, "$1"));
        return isNaN(numericValue) ? undefined : numericValue;
    }
    return undefined;
}

export function handleBlur(e: React.FocusEvent, editor: GetEditorParams): void {
    editor.stopEditing();
};