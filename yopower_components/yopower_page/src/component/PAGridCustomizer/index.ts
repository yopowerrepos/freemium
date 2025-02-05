import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { cellRendererOverrides } from "./customizers/CellRendererOverrides";
import { cellEditorOverrides } from "./customizers/CellEditorOverrides";
import { PAOneGridCustomizer } from "./types";
import * as React from "react";

export class yppagridextd implements ComponentFramework.ReactControl<IInputs, IOutputs> {

	private _context: ComponentFramework.Context<IInputs>;
	private _timeout: number;

	constructor() {
		this._timeout = 5 * 60 * 1000;
	}

	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary): void {
		this._context = context;
		const eventName = context.parameters.EventName.raw;
		const subgrid = (context.utils as any).getParentControlName();
		const table = (context as any).cards._customControlProperties.descriptor.Parameters.TargetEntityType;
		if (eventName) {
			this.populateSchema(subgrid).then((_) => {
				const paOneGridCustomizer: PAOneGridCustomizer =
				{
					cellRendererOverrides: cellRendererOverrides(subgrid, table, context),
					cellEditorOverrides: cellEditorOverrides(subgrid, table, context),
				};
				(context as any).factory.fireEvent(eventName, paOneGridCustomizer);
			});
		}
	}

	public async populateSchema(key: string): Promise<void> {
		const schema = localStorage.getItem(key);
		if (schema === null) {
			const data = await this.retrieveSubgridDefinition(key);
			localStorage.setItem(key, JSON.stringify({ value: data, expiry: Date.now() + this._timeout }));
		}
		else {
			const json = JSON.parse(schema);
			if (Object.keys(json.value).length === 0 || Date.now() > json.expiry) {
				const data = await this.retrieveSubgridDefinition(key);
				localStorage.removeItem(key);
				localStorage.setItem(key, JSON.stringify({ value: data, expiry: Date.now() + this._timeout }));
			}
			else
				return;
		}
		// localStorage.removeItem(key);
	}

	private async retrieveSubgridDefinition(key: string): Promise<string | null> {
		try {
			const execute_yp_get_subgrid_definitions_Request = {
				subgrid: key,
				getMetadata: () => ({
					boundParameter: null,
					parameterTypes: {
						subgrid: { typeName: "Edm.String", structuralProperty: 1 },
					},
					operationType: 0,
					operationName: "yp_get_subgrid_definitions",
				}),
			};
			const response = await (this._context.webAPI as any).execute(execute_yp_get_subgrid_definitions_Request);
			if (response.ok) {
				const result = await response.json();
				if (result.success) {
					return result.data;
				} else {
					this._context.navigation.openErrorDialog({ message: result.message });
					return null;
				}
			}
			else
				return null;
		} catch (error: any) {
			this._context.navigation.openErrorDialog({ message: error.message });
			return null;
		}
	}

	public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
		return React.createElement(React.Fragment);
	}

	public getOutputs(): IOutputs { return {}; }

	public destroy(): void { }
}
