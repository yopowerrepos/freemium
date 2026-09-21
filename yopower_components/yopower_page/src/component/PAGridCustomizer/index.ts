import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { cellRendererOverrides } from "./customizers/CellRendererOverrides";
import { cellEditorOverrides } from "./customizers/CellEditorOverrides";
import { PAOneGridCustomizer } from "./types";
import { CustomColumnDefinition } from "./models/common/CustomColumnDefinition";
import * as React from "react";

import {
	initModifierTracker,
	subscribeToModifierChange,
	getModifierState,
	setHideValues,
} from "./ControlKeyTracker";

export class yppagridextd implements ComponentFramework.ReactControl<IInputs, IOutputs> {

	private _context: ComponentFramework.Context<IInputs>;
	private _timeout: number;
	private _subgrid: string = "";
	private _subgridvisibility: string = "";
	private _table: string = "";
	private _eventName: string = "";
	private _hidden: boolean = false;

	constructor() {
		this._timeout = 1440 * 60 * 1000; // 24 hours
	}

	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary): void {
		this._context = context;
		
		this._eventName = context.parameters.EventName.raw ?? "";
		this._table =
		(context as any).cards?._customControlProperties?.descriptor?.Parameters?.TargetEntityType ??
		(context as any).navigation?._customControlProperties?.contextToken?.entityTypeName;
		
		this._subgrid = (context.utils as any).getParentControlName?.() || this._table;
		this._subgridvisibility = `${this._subgrid}_visibility`;

		initModifierTracker(this._subgrid, this._subgridvisibility);

		if (this._eventName) {

			this.populateSchema(this._subgrid).then(() => {
				this.restoreVisibility();
				this.fireGridEvent();
				subscribeToModifierChange((modifiers) => {
					// Persist only when the user toggled the show / hide, not on every CTRL / SHIFT
					if (modifiers.hideValues !== this._hidden)
						this.saveVisibility(modifiers.hideValues);

					this.fireGridEvent();
				});
			});
		}
	}

	/**
	 * Restores the last show / hide state chosen by the user (CTRL pressed twice).
	 * The state is dropped when it expired or when the definitions behind it changed,
	 * so a column that is not configured to be masked anymore is displayed again.
	 */
	private restoreVisibility(): void {
		const stored = localStorage.getItem(this._subgridvisibility);
		if (!stored) return;

		try {
			const json = JSON.parse(stored);
			if (json.fingerprint !== this.getVisibilityFingerprint() || Date.now() > json.expiry) {
				localStorage.removeItem(this._subgridvisibility);
				return;
			}
			this._hidden = json.value === true;
			setHideValues(this._hidden);
		} catch {
			localStorage.removeItem(this._subgridvisibility);
		}
	}

	/**
	 * Persists the show / hide state together with the fingerprint of the settings it was chosen on
	 * @param hidden True when the user chose to hide (mask) the customizers
	 */
	private saveVisibility(hidden: boolean): void {
		this._hidden = hidden;
		localStorage.setItem(this._subgridvisibility, JSON.stringify({
			value: hidden,
			fingerprint: this.getVisibilityFingerprint(),
			expiry: Date.now() + this._timeout
		}));
	}

	/**
	 * Signature of the show / hide configuration of the cached schema.
	 * Only the parts driving the masking are taken into account (id, type and showhide),
	 * so changing colors or any other parameter does not reset the user choice.
	 */
	private getVisibilityFingerprint(): string {
		const schema = localStorage.getItem(this._subgrid);
		if (!schema) return "";

		try {
			const definitions = JSON.parse(JSON.parse(schema).value).definitions as CustomColumnDefinition[];
			const signature = definitions
				.map(d => `${d.id}:${d.type}:${d.showhide === true ? 1 : 0}`)
				.sort()
				.join("|");

			let hash = 0;
			for (let i = 0; i < signature.length; i++)
				hash = ((hash << 5) - hash + signature.charCodeAt(i)) | 0;

			return hash.toString(36);
		} catch {
			return "";
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