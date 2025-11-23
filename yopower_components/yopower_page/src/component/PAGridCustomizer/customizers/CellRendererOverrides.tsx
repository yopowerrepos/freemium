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
import { getNewRelatedRecordCell } from "./NewRelatedRecord";
import { CopilotExecuteEventCell } from "./CopilotExecuteEventCell";
import { NotesCell } from "./NotesCell";
import { ModifierState } from "../ControlKeyTracker";
import { ICell } from "../interfaces/ICell";
import { getRichTextPopoverCell } from "./RichTextCell";
import { AuditedCell } from "./AuditedCell";
import { CustomTimeLineCell } from "./CustomTimeLineCell";

export function cellRendererOverrides(
	subgrid: string,
	tableLogicalName: string,
	context: ComponentFramework.Context<IInputs>,
	modifiers: ModifierState): CellRendererOverrides {
	const schema = localStorage.getItem(subgrid);
	let definitions = new Array<CustomColumnDefinition>();
	if (schema !== null)
		definitions = JSON.parse(JSON.parse(schema).value).definitions as CustomColumnDefinition[];

	const supportedDataTypes: ColumnDataType[] = ["Text", "Email", "Phone", "Ticker", "URL", "TextArea", "Lookup", "Customer", "Owner", "MultiSelectPicklist", "OptionSet", "TwoOptions", "Duration", "Language", "Multiple", "TimeZone", "Integer", "Currency", "Decimal", "FloatingPoint", "AutoNumber", "DateOnly", "DateAndTime", "Image", "File", "Persona", "RichText", "UniqueIdentifier"];

	// Dynamically create the CellRendererOverrides object
	const overrides: CellRendererOverrides = supportedDataTypes.reduce((acc, dataType) => {
		// Create a function for each data type that returns the appropriate component
		// The function will receive the parameters needed to render the cell
		// and will call getComponent with the correct parameters
		acc[dataType] = (props, col) =>
			getComponent(
				context,
				modifiers,
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
	modifiers: ModifierState,
	col: GetRendererParams,
	props: any,
	definitions: CustomColumnDefinition[],
	table: string,
	column: string,
	subgrid: string
): React.ReactElement | null | undefined {
	const definition = Helper.getDefinition(definitions, table, column, col.rowData!, modifiers);
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

		let cell: ICell = {
			context: context,
			params: col,
			props: props,
			definition: definition,
			table: table,
			id: col.rowData!.__rec_id,
			subgrid: subgrid,
			col: col.colDefs[col.columnIndex],
			overrideFormattedValue: props.formattedValue !== null && props.formattedValue !== "" ? props.formattedValue : ""
		};

		switch (definition.type) {
			//Any [Navigate To]
			case 900:
				return getRowNavigateButtonsCell(cell);
				break;

			//Any [Read-Only]
			case 901:
				return getReadOnlyCell(cell);
				break;

			//Any [Related Records]
			case 902:
				return <RelatedRecordsCell {...cell} />;
				break;

			//Any [Copilot Execute Event]
			case 903:
				return <CopilotExecuteEventCell {...cell} />;

			// Any [Dependent Colorful Cell]
			case 904:
				const foundColumn = Object.keys(col.rowData!).find(k => k.includes(JSON.parse(definition.parameters).column));
				if (foundColumn !== undefined) {
					const columnDefinition = col.colDefs.filter(f => f.name === foundColumn)[0]!;
					cell.col = columnDefinition, { dataType: columnDefinition.dataType };
					cell.props = {
						value: (col.rowData as any)[foundColumn],
						formattedValue: (col.rowData as any)[foundColumn]
					}
					return getColorfulCell(cell);
				}
				else
					return null;
				break;

			//Any [New Contextualized Record]
			case 905:
				return getNewRelatedRecordCell(cell);
				break;

			//Any [Notes]
			case 906:
				return <NotesCell {...cell} />;

			//Any [Audited Cell]
			case 907:
				return <AuditedCell {...cell} />;

			//Any [Audited Cell]
			case 908:
				return <CustomTimeLineCell {...cell} />;

			// Lookup [Navigate Buttons]
			case 800:
				return getLookupNavigateButtonsCell(cell);
				break;

			// Number & Date Time [Colorful Cell]
			case 700:
				return getColorfulCell(cell);
				break;

			// Number [Progress Bar Cell]
			case 701:
				return gerProgressBarCell(cell);
				break;

			//Any [File]
			case 600:
				if (cell.props.value === undefined && cell.props.value !== null)
					cell.props.value = {
						fileUrl: "",
						fileName: "--",
						fileSize: 0,
						mimeType: ""
					};
				return <FileCell {...cell} />;
				break;

			//Text [Rich Text]
			case 500:
				return getRichTextPopoverCell(cell);
				break;
		}
	}
	return;
}