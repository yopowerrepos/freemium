import * as React from "react";
import { CellEditorOverrides, ColumnDataType, GetEditorParams } from "../types";
import { CustomColumnDefinition } from "../models/CustomColumnDefinition";
import { Helper } from "../helper";
import { IInputs } from "../generated/ManifestTypes";
import { getFilteredLookupCell } from "./FilteredLookupCell";
import { getReadOnlyCell } from "./ReadOnlyCell";

export function cellEditorOverrides(
	subgrid: string,
	tableLogicalName: string,
	context: ComponentFramework.Context<IInputs>): CellEditorOverrides {

	const schema = localStorage.getItem(subgrid);
	let definitions = new Array<CustomColumnDefinition>();

	if (schema !== null)
		definitions = JSON.parse(JSON.parse(schema).value).definitions as CustomColumnDefinition[];

	const supportedDataTypes: ColumnDataType[] = ["Text", "Email", "Phone", "Ticker", "URL", "TextArea", "Lookup", "Customer", "Owner", "MultiSelectPicklist"
		, "OptionSet"
		, "TwoOptions"
		, "Duration"
		, "Language"
		, "Multiple"
		, "TimeZone"
		, "Integer"
		, "Currency"
		, "Decimal"
		, "FloatingPoint"
		, "AutoNumber"
		, "DateOnly"
		, "DateAndTime"
		, "Image"
		, "File"
		, "Persona"
		, "RichText"
		, "UniqueIdentifier"];

	// Dynamically create the CellRendererOverrides object
	const overrides: CellEditorOverrides = supportedDataTypes.reduce((acc, dataType) => {
		acc[dataType] = (props, col) =>
			getComponent(props, col, definitions, tableLogicalName, col.colDefs[col.columnIndex].name, context);
		return acc;
	}, {} as CellEditorOverrides);

	return overrides;
};

export function getComponent(props: any, col: GetEditorParams, definitions: CustomColumnDefinition[], table: string, column: string, context: ComponentFramework.Context<IInputs>): React.ReactElement | null | undefined {
	const definition = Helper.getDefinition(definitions, table, column, col.rowData!);
	if (definition !== null) {
		switch (definition.type) {

			//Any [Read-Only]
			case 901:
				return getReadOnlyCell(context, col, col.colDefs[col.columnIndex], props, definition, table, col.rowData!.__rec_id);
				break;
				
			//Lookup [Filtered Lookup]
			case 801:
				return getFilteredLookupCell(context, col, col.colDefs[col.columnIndex], props, definition, table, col.rowData!.__rec_id);
				break;
		}
	}
}

