import * as React from "react";
import { Icon } from "@fluentui/react";
import { ICell } from "../interfaces/ICell";
import { _700NumbersNDateTimeColors } from "../models/customizers/_700NumbersNDateTimeColors";
import { GetRendererParams } from "../types";
import { RuleCondition } from "../models/common/RuleColor";

export function getColors(cell: ICell): React.ReactElement | null | undefined {
	const params = JSON.parse(cell.definition.parameters) as (_700NumbersNDateTimeColors);

	// Compute own-cell value (used when condition.column is null)
	let ownValue: number | null = null;
	let formattedValue: string | null = null;
	switch (cell.col.dataType) {
		case "DateOnly":
		case "DateAndTime":
			ownValue = cell.props.value !== null ? calcDateTimeDiffInMinutes(new Date(cell.props.value)) : null;
			formattedValue = dateTimeLabel(ownValue) + " " + cell.props.formattedValue;
			break;

		case "Duration":
			ownValue = Number(cell.props.value);
			formattedValue = dateTimeLabel(ownValue);
			break;

		case "Integer":
		case "Decimal":
		case "FloatingPoint":
		case "Currency":
		case "OptionSet":
		case "TwoOptions":
			ownValue = cell.props.value !== null && cell.props.value !== undefined ? Number(cell.props.value) : null;
			formattedValue = cell.props.formattedValue;
			break;
	}

	const rowData = (cell.params as GetRendererParams).rowData;

	const rule = params.rules.find(r => {
		const group = r.group ?? "or";
		const results = r.conditions.map((condition: RuleCondition) => {
			let value: number | null;
			if (condition.column == cell.col.name) {
				value = ownValue;
			} else {
				const colKey = Object.keys(rowData!).find(k => k.includes(condition.column!));
				const raw = colKey ? (rowData as any)[colKey] : null;
				if (raw !== null && raw !== undefined) {
					if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(raw))
						value = calcDateTimeDiffInMinutes(new Date(raw));
					else if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw))
						value = calcDateTimeDiffInMinutes(new Date(raw));
					else if (typeof raw === 'boolean')
						value = raw ? 1 : 0;
					else if (!isNaN(Number(raw)))
						value = Number(raw);
					else
						value = null;
				} else
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

	if (rule) {
		const background = rule.output.background ?? "transparent";
		const color = rule.output.color ?? "black";
		return <div
			title={(cell.overrideFormattedValue !== "" ? cell.overrideFormattedValue! : formattedValue!) + "\r\n" + (rule.output.label ?? "")}
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
			<Icon iconName={rule.output.icon} style={{ marginRight: 3 }} />
			<div style={{ height: 20 }}>
				{(cell.overrideFormattedValue !== null ? cell.overrideFormattedValue! : formattedValue!)}
			</div>
		</div>;
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
