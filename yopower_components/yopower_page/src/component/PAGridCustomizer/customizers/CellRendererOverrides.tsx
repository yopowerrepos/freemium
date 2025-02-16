import * as React from "react";
import { CellRendererOverrides, ColumnDataType, ColumnDefinition, GetRendererParams, RECID } from "../types";
import { anchorProperties, CommandButton, IconButton, IContextualMenuItem, IContextualMenuProps, IIconProps, Label, ProgressIndicator } from "@fluentui/react";
import { CustomColumnDefinition } from "../models/CustomColumnDefinition";
import { IInputs } from "../generated/ManifestTypes";
import { Helper } from "../helper";
import { getColorfulCel } from "./ColorfulCel";
import { getReadOnlyCel } from "./ReadOnlyCel";
import { getLookupNavigateButtonsCel } from "./LookupNavigateButtonsCel";
import { getRowNavigateButtonsCel } from "./RowNavigateButtonsCel";
import { gerProgressBarCel } from "./ProgressIndicatorCel";
import { RelatedRecordsCell } from "./RelatedRecords";

const editIcon: IIconProps = { iconName: 'Edit' };
const clearIcon: IIconProps = { iconName: 'Clear' };

export function cellRendererOverrides(
	subgrid: string,
	tableLogicalName: string,
	context: ComponentFramework.Context<IInputs>): CellRendererOverrides {

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
	const overrides: CellRendererOverrides = supportedDataTypes.reduce((acc, dataType) => {
		acc[dataType] = (props, col) =>
			getComponent(props, col, definitions, tableLogicalName, col.colDefs[col.columnIndex].name, context);
		return acc;
	}, {} as CellRendererOverrides);

	return overrides;
};

export function getComponent(props: any, col: GetRendererParams, definitions: CustomColumnDefinition[], table: string, column: string, context: ComponentFramework.Context<IInputs>): React.ReactElement | null | undefined {
	const definition = Helper.getDefinition(definitions, table, column);
	if (definition !== null) {
		switch (definition.type) {
			//Any [Navigate To]
			case 900:
				return getRowNavigateButtonsCel(
					col.colDefs[col.columnIndex],
					props,
					definition,
					table,
					col.rowData!.__rec_id);
				break;

			//Any [Read-Only]
			case 901:
				return getReadOnlyCel(
					col.colDefs[col.columnIndex],
					props,
					definition);
				break;

			//Any [Related Records]
			case 902:
				return <RelatedRecordsCell
					context={context}
					editor={col}
					col={col.colDefs[col.columnIndex]}
					props={props}
					definition={definition}
					table={table}
				/>
				break;

			// Lookup [Navigate Buttons]
			case 800:
				return getLookupNavigateButtonsCel(
					col.colDefs[col.columnIndex],
					props,
					definition);
				break;

			// Number & Date Time [Colorful Cel]
			case 700:
				return getColorfulCel(
					col.colDefs[col.columnIndex],
					props,
					definition);
				break;

			// Number [Colorful Cel]
			case 701:
				return gerProgressBarCel(
					col.colDefs[col.columnIndex],
					props,
					definition);
				return
		}
	}
	return;
}