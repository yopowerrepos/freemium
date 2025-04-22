import * as React from "react";
import { ColumnDefinition, GetRendererParams } from "../types";
import { IInputs } from "../generated/ManifestTypes";
import { Icon } from "@fluentui/react";

export function getColorfulCell(
	context: ComponentFramework.Context<IInputs>,
	render: GetRendererParams,
	col: ColumnDefinition,
	props: any,
	definition: any,
	table: string,
	id: string): React.ReactElement | null | undefined {
	if (props.value !== null && props.value !== undefined) {
		const rules = JSON.parse(definition.parameters).rules as Array<any>;
		let value: number | null = null;
		let formattedValue: string | null;
		switch (col.dataType) {
			case "DateOnly":
			case "DateAndTime":
				value = calcDateTimeDiffInMinutes(new Date(props.value));
				formattedValue = dateTimeLabel(value) + " " + props.formattedValue;
				break;

			case "Duration":
				value = props.value as number;
				formattedValue = dateTimeLabel(value);
				break;

			case "Integer":
			case "Decimal":
			case "FloatingPoint":
			case "Currency":
				value = props.value as number;
				formattedValue = props.value;
				break;
		}

		const rule = rules.find(r => r.min <= value! && r.max >= value!) ?? null;
		if (rule) {
			const background = rule.background ?? "transparent";
			const color = rule.color ?? "black";
			return <div
				title={formattedValue! + "\r\n" + rule!.label!}
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
				onClick={(e) => { definition.settings.editable ? props.startEditing() : e.preventDefault() }}>
				<Icon iconName={rule.icon} style={{ marginRight: 3 }} />
				<div>{formattedValue!}</div>
			</div>;
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