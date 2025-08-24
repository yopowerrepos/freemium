import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { cellRendererOverrides } from "./customizers/CellRendererOverrides";
import { cellEditorOverrides } from "./customizers/CellEditorOverrides";
import { PAOneGridCustomizer } from "./types";
import * as React from "react";

import {
	initModifierTracker,
	subscribeToModifierChange,
	getModifierState,
} from "./ControlKeyTracker";

export class yppagridextd implements ComponentFramework.ReactControl<IInputs, IOutputs> {

	private _context: ComponentFramework.Context<IInputs>;
	private _timeout: number;
	private _subgrid: string = "";
	private _table: string = "";
	private _eventName: string = "";

	constructor() {
		this._timeout = 30 * 60 * 1000; // 30 minutes
	}

	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary): void {
		this._context = context;
		initModifierTracker();

		this._eventName = context.parameters.EventName.raw ?? "";
		this._table =
			(context as any).cards?._customControlProperties?.descriptor?.Parameters?.TargetEntityType ??
			(context as any).navigation?._customControlProperties?.contextToken?.entityTypeName;

		this._subgrid = (context.utils as any).getParentControlName?.() || this._table;

		if (this._eventName) {

			this.populateSchema(this._subgrid).then(() => {
				this.fireGridEvent();
				subscribeToModifierChange(() => {
					this.fireGridEvent();
				});
			});
		}
	}

	private fireGridEvent(): void {
		const modifiers = getModifierState(); 
		const customizer: PAOneGridCustomizer = {
			cellRendererOverrides: cellRendererOverrides(this._subgrid, this._table, this._context, modifiers),
			cellEditorOverrides: cellEditorOverrides(this._subgrid, this._table, this._context),
		};
		(this._context as any).factory.fireEvent(this._eventName, customizer);
	}

	public async populateSchema(key: string): Promise<void> {
		const existing = localStorage.getItem(key);
		if (!existing) {
			const data = await this.retrieveSubgridDefinition(key);
			localStorage.setItem(key, JSON.stringify({ value: data, expiry: Date.now() + this._timeout }));
			return;
		}

		const json = JSON.parse(existing);
		if (Object.keys(json.value).length === 0 || Date.now() > json.expiry) {
			const data = await this.retrieveSubgridDefinition(key);
			localStorage.setItem(key, JSON.stringify({ value: data, expiry: Date.now() + this._timeout }));
		}
	}

	private async retrieveSubgridDefinition(key: string): Promise<string | null> {
		try {
			const request = {
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
			const response = await (this._context.webAPI as any).execute(request);
			if (response.ok) {
				const result = await response.json();
				if (result.success) {
					return result.data;
				} else {
					this._context.navigation.openErrorDialog({ message: result.message });
					return null;
				}
			}
			return null;
		} catch (error: any) {
			this._context.navigation.openErrorDialog({ message: error.message });
			return null;
		}
	}

	public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
		return React.createElement(React.Fragment); // No visible UI
	}

	public getOutputs(): IOutputs {
		return {};
	}

	public destroy(): void {
		// Clean up if needed
	}
}