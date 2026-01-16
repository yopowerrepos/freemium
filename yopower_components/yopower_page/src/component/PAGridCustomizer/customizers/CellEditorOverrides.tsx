import * as React from "react";
import { CellEditorOverrides, ColumnDataType, GetEditorParams } from "../types";
import { CustomColumnDefinition } from "../models/common/CustomColumnDefinition";
import { Helper } from "../helper";
import { IInputs } from "../generated/ManifestTypes";
import { getLookupFilteredLookup } from "./LookupFilteredLookup";
import { getAnyReadOnly } from "./AnyReadOnly";
import { NumbersDuration } from "./NumbersDuration";
import { ICell } from "../interfaces/ICell";

export function cellEditorOverrides(
	subgrid: string,
	tableLogicalName: string,
	context: ComponentFramework.Context<IInputs>): CellEditorOverrides {

	const schema = localStorage.getItem(subgrid);
	let definitions = new Array<CustomColumnDefinition>();

	if (schema !== null)
		definitions = JSON.parse(JSON.parse(schema).value).definitions as CustomColumnDefinition[];

	const supportedDataTypes: ColumnDataType[] = ["Text", "Email", "Phone", "Ticker", "URL", "TextArea", "Lookup", "Customer", "Owner", "MultiSelectPicklist", "OptionSet", "TwoOptions", "Duration", "Language", "Multiple", "TimeZone", "Integer", "Currency", "Decimal", "FloatingPoint", "AutoNumber", "DateOnly", "DateAndTime", "Image", "File", "Persona", "RichText", "UniqueIdentifier"];

	// Dynamically create the CellRendererOverrides object
	const overrides: CellEditorOverrides = supportedDataTypes.reduce((acc, dataType) => {
		acc[dataType] = (props, col) =>
			getComponent(
				context,
				col,
				props,
				definitions,
				tableLogicalName,
				col.colDefs[col.columnIndex].name,
				subgrid);
		return acc;
	}, {} as CellEditorOverrides);

	return overrides;
};

export function getComponent(
	context: ComponentFramework.Context<IInputs>,
	col: GetEditorParams,
	props: any,
	definitions: CustomColumnDefinition[],
	table: string,
	column: string,
	subgrid: string
): React.ReactElement | null | undefined {
	const definition = Helper.getDefinition(definitions, table, column, col.rowData!);
	if (definition !== null) {

		let cell: ICell = {
			context: context,
			params: col,
			props: props,
			definition: definition,
			table: table,
			id: col.rowData!.__rec_id,
			subgrid: subgrid,
			col: col.colDefs[col.columnIndex],
			overrideFormattedValue: null
		};

		switch (definition.type) {
			case 901: return getAnyReadOnly(cell); break;
			case 801: return getLookupFilteredLookup(cell); break;
			case 702: return <NumbersDuration {...cell} />; break;
		}
	}
}

