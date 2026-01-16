import * as React from "react";
import { CellRendererOverrides, ColumnDataType, GetRendererParams } from "../types";
import { IInputs } from "../generated/ManifestTypes";
import { CustomColumnDefinition } from "../models/common/CustomColumnDefinition";
import { _904AnyDependentColors } from "../models/customizers/_904AnyDependentColors";
import { ICell } from "../interfaces/ICell";
import { ModifierState } from "../ControlKeyTracker";
import { Helper } from "../helper";
import { getAnyNavigationTo } from "./AnyNavigateTo";
import { getAnyReadOnly } from "./AnyReadOnly";
import { AnyRelatedRecords } from "./AnyRelatedRecords";
import { AnyCopilotExecuteEvent } from "./AnyCopilotExecuteEvent";
import { getColors } from "./Colors";
import { getAnyNewRelatedRecord } from "./AnyNewRelatedRecord";
import { AnyNotes } from "./AnyNotes";
import { AnyAuditHistory } from "./AnyAuditHistory";
import { AnyCustomTimeline } from "./AnyCustomTimeline";
import { getLookupNavigateTo } from "./LookupNavigateButtonsCell";
import { getNumbersProgressBar } from "./NumbersProgressBar";
import { FileManagement } from "./FileManagement";
import { getTextRichTextPopover } from "./TextRichTextPopover";
import { _909AnyColorByHex } from "../models/customizers/_909AnyColorByHex";
import def from "ajv/dist/vocabularies/discriminator";
import { getAnyColorByHex } from "./AnyColorByHex";

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
			case 900: return getAnyNavigationTo(cell); break;
			case 901: return getAnyReadOnly(cell); break;
			case 902: return <AnyRelatedRecords {...cell} />; break;
			case 903: return <AnyCopilotExecuteEvent {...cell} />; break;
			case 904:
				{
					const params = JSON.parse(definition.parameters) as _904AnyDependentColors;
					const column = Object.keys(col.rowData!).find(k => k.includes(params.column));
					if (column !== undefined) {
						const definition = col.colDefs.filter(f => f.name === column)[0]!;
						cell.col = definition, { dataType: definition.dataType };
						cell.props = {
							value: (col.rowData as any)[column],
							formattedValue: (col.rowData as any)[column]
						}
						return getColors(cell);
					}
					else
						return null;
				}
				break;
			case 905: return getAnyNewRelatedRecord(cell); break;
			case 906: return <AnyNotes {...cell} />; break;
			case 907: return <AnyAuditHistory {...cell} />; break;
			case 908: return <AnyCustomTimeline {...cell} />; break;
			case 909: {
				const params = JSON.parse(definition.parameters) as _909AnyColorByHex;
				const column = Object.keys(col.rowData!).find(k => k.includes(params.column));
				if (column !== undefined) {
					const definition = col.colDefs.filter(f => f.name === column)[0]!;
					cell.col = definition, { dataType: definition.dataType };
					cell.props = {
						value: (col.rowData as any)[column],
						formattedValue: cell.props.formattedValue
					}
					return getAnyColorByHex(cell);
				}
				else
					return null;
			}
				break;
			case 800: return getLookupNavigateTo(cell); break;
			case 700: return getColors(cell); break;
			case 701: return getNumbersProgressBar(cell); break;
			case 600: if (cell.props.value === undefined && cell.props.value !== null)
				cell.props.value = { fileUrl: "", fileName: "--", fileSize: 0, mimeType: "" };
				return <FileManagement {...cell} />;
				break;
			case 500: return getTextRichTextPopover(cell); break;
		}
	}
	return;
}