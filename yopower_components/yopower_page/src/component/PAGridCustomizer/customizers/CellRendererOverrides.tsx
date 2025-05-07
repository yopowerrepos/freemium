import * as React from "react";
import { CellRendererOverrides, ColumnDataType, ColumnDefinition, GetRendererParams, RECID } from "../types";
import { CustomColumnDefinition } from "../models/CustomColumnDefinition";
import { IInputs } from "../generated/ManifestTypes";
import { Helper } from "../helper";
import { getColorfulCell } from "./ColorfulCell";
import { getReadOnlyCell } from "./ReadOnlyCell";
import { getLookupNavigateButtonsCell } from "./LookupNavigateButtonsCell";
import { getRowNavigateButtonsCell } from "./RowNavigateButtonsCell";
import { gerProgressBarCell } from "./ProgressIndicatorCell";
import { RelatedRecordsCell } from "./RelatedRecordsCell";
import { FileCell } from "./FileCell";
import { format } from "path";
import { getNewRelatedRecordCell } from "./NewRelatedRecord";

export function cellRendererOverrides(
	subgrid: string,
	tableLogicalName: string,
	context: ComponentFramework.Context<IInputs>): CellRendererOverrides {

	const schema = localStorage.getItem(subgrid);
	let definitions = new Array<CustomColumnDefinition>();

	if (schema !== null)
		definitions = JSON.parse(JSON.parse(schema).value).definitions as CustomColumnDefinition[];

	const supportedDataTypes: ColumnDataType[] = ["Text", "Email", "Phone", "Ticker", "URL", "TextArea", "Lookup", "Customer", "Owner", "MultiSelectPicklist", "OptionSet", "TwoOptions", "Duration", "Language", "Multiple", "TimeZone", "Integer", "Currency", "Decimal", "FloatingPoint", "AutoNumber", "DateOnly", "DateAndTime", "Image", "File", "Persona", "RichText", "UniqueIdentifier"];

	// Dynamically create the CellRendererOverrides object
	const overrides: CellRendererOverrides = supportedDataTypes.reduce((acc, dataType) => {
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
	}, {} as CellRendererOverrides);

	return overrides;
};

export function getComponent(
	context: ComponentFramework.Context<IInputs>,
	col: GetRendererParams,
	props: any,
	definitions: CustomColumnDefinition[],
	table: string,
	column: string,
	subgrid: string
): React.ReactElement | null | undefined {
	const definition = Helper.getDefinition(definitions, table, column, col.rowData!);
	if (definition !== null) {

		// Additional Settings
		if (definition.settings !== null) {
			// Editable
			(col.colDefs[col.columnIndex] as any).editable = definition.settings.editable;

			// Allow Pin
			if (definition.settings.allowPin)
				(col.colDefs[col.columnIndex] as any).pinMenuItem = 'show';
			else
				(col.colDefs[col.columnIndex] as any).pinMenuItem = 'hide';

			// Rename Columns
			// if(definition.settings.renameColumn)
			// 	(col.colDefs[col.columnIndex] as any).displayName = definition.settings.renameColumn;
		}

		switch (definition.type) {
			//Any [Navigate To]
			case 900:
				return getRowNavigateButtonsCell(context, col, col.colDefs[col.columnIndex], props, definition, table, col.rowData!.__rec_id);
				break;

			//Any [Read-Only]
			case 901:
				return getReadOnlyCell(context, col, col.colDefs[col.columnIndex], props, definition, table, col.rowData!.__rec_id);
				break;

			//Any [Related Records]
			case 902:
				return <RelatedRecordsCell context={context} editor={col} col={col.colDefs[col.columnIndex]} props={props} definition={definition} table={table} id={col.rowData!.__rec_id} />
				break;

			// Any [Dependent Colorful Cell]
			case 904:
				const foundColumn = Object.keys(col.rowData!).find(k => k.includes(JSON.parse(definition.parameters).column));
				if (foundColumn !== undefined)
					return getColorfulCell(
						context,
						col,
						col.colDefs.filter(f => f.name === foundColumn)[0],
						{
							value: (col.rowData as any)[foundColumn],
							formattedValue: (col.rowData as any)[foundColumn]
						},
						definition,
						table,
						col.rowData!.__rec_id,
						props.formattedValue !== null && props.formattedValue !== "" ? props.formattedValue : ""
					);
				else
					return null;
				break;

			//Any [New Contextualized Record]
			case 905:
				return getNewRelatedRecordCell(context, col, col.colDefs[col.columnIndex], props, definition, table, col.rowData!.__rec_id);
				break;

			// Lookup [Navigate Buttons]
			case 800:
				return getLookupNavigateButtonsCell(context, col, col.colDefs[col.columnIndex], props, definition, table, col.rowData!.__rec_id);
				break;

			// Number & Date Time [Colorful Cell]
			case 700:
				return getColorfulCell(context, col, col.colDefs[col.columnIndex], props, definition, table, col.rowData!.__rec_id);
				break;

			// Number [Progress Bar Cell]
			case 701:
				return gerProgressBarCell(context, col, col.colDefs[col.columnIndex], props, definition, table, col.rowData!.__rec_id);
				break;

			//Any [File]
			case 600:
				if (props.value == undefined && props.value !== null)
					props.value = {
						fileUrl: "",
						fileName: "--",
						fileSize: 0,
						mimeType: ""
					};
				return <FileCell context={context} render={col} col={col.colDefs[col.columnIndex]} props={props} definition={definition} table={table} id={col.rowData!.__rec_id}
				/>
				break;
		}
	}
	return;
}