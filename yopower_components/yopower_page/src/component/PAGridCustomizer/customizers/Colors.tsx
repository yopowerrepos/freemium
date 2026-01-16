import * as React from "react";
import { Icon } from "@fluentui/react";
import { ICell } from "../interfaces/ICell";
import { _700NumbersNDateTimeColors } from "../models/customizers/_700NumbersNDateTimeColors";

export function getColors(cell: ICell): React.ReactElement | null | undefined {
	if (cell.props.value !== null && cell.props.value !== undefined) {
		const params = JSON.parse(cell.definition.parameters) as (_700NumbersNDateTimeColors);
		let value: number | null = null;
		let formattedValue: string | null;
		switch (cell.col.dataType) {
			case "DateOnly":
			case "DateAndTime":
				value = calcDateTimeDiffInMinutes(new Date(cell.props.value));
				formattedValue = dateTimeLabel(value) + " " + cell.props.formattedValue;
				break;

			case "Duration":
				value = Number(cell.props.value);
				formattedValue = dateTimeLabel(value);
				break;

			case "Integer":
			case "Decimal":
			case "FloatingPoint":
			case "Currency":
				value = Number(cell.props.value);
				formattedValue = cell.props.formattedValue;
				break;

			case "OptionSet":
				value = Number(cell.props.value);
				formattedValue = cell.props.formattedValue;
				break;

			case "TwoOptions":
				value = Number(cell.props.value);
				formattedValue = cell.props.formattedValue;
				break;
		}

		const rule = params.rules.find(r => r.min <= value! && r.max >= value!) ?? null;
		if (rule) {
			const background = rule.background ?? "transparent";
			const color = rule.color ?? "black";
			return <div
				title={(cell.overrideFormattedValue !== "" ? cell.overrideFormattedValue! : formattedValue!) + "\r\n" + rule!.label!}
				style={{
					padding: "4px 8px",
					borderRadius: 2,
					textAlign: "center",
					background: background,
					color: color,
					lineHeight: "20px",
					display: "flex",
					margin: "4px"
				}}
				onKeyDown={(e) => { cell.definition.settings.editable ? cell.props.startEditing() : e.preventDefault() }}
				onClick={(e) => { cell.definition.settings.editable ? cell.props.startEditing() : e.preventDefault() }}>
				<Icon iconName={rule.icon} style={{ marginRight: 3 }} />
				<div style={{ height: 20 }}>
					{(cell.overrideFormattedValue !== null ? cell.overrideFormattedValue! : formattedValue!)}
				</div>
			</div >;
		}
	}
}

export function calcDateTimeDiffInMinutes(value: Date) {
	const difference = value.getTime() - new Date().getTime();
	return Math.floor(difference / (1000 * 60));
}

export function dateTimeLabel(value: number | null): string {
	if (value === null)
		return "";

	let displayValue = '';
	if (value >= 1440) {
		const differenceInDays = Math.floor(value / 1440);
		displayValue = `${differenceInDays} day(s)`;
	} else if (value >= 60) {
		const differenceInHours = Math.floor(value / 60);
		displayValue = `${differenceInHours} hour(s)`;
	} else if (value >= 0) {
		displayValue = `${value} minute(s)`;
	} else {
		const absoluteMinutes = Math.abs(value);
		if (absoluteMinutes >= 1440) {
			const differenceInDays = Math.floor(absoluteMinutes / 1440);
			displayValue = `-${differenceInDays} day(s)`;
		} else if (absoluteMinutes >= 60) {
			const differenceInHours = Math.floor(absoluteMinutes / 60);
			displayValue = `-${differenceInHours} hour(s)`;
		} else {
			displayValue = `-${absoluteMinutes} minute(s)`;
		}
	}
	return displayValue;
}