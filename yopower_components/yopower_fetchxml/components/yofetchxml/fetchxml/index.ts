import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { FetchXmlDesigner, IFetchXmlDesignerProps } from "./components/FetchXmlDesigner";
import {
    parseAllowedEntities,
    getAllEntityNames,
    getEntityAttributes,
    getEntityRelationships,
    pickLookupValue,
    runFetchXml,
    getUserAadObjectId,
    resolveRecordLabel,
    openRecordInDialog,
} from "./services/metadataService";
import { parsePlaceholderConfig } from "./services/placeholderService";
import { parseRequiredFields } from "./models/requiredFieldModel";
import { parseRequiredAliases } from "./models/requiredAliasModel";

export class fetchxml implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    private context: ComponentFramework.Context<IInputs>;
    private currentXml: string;

    /**
     * Empty constructor.
     */
    constructor() {
        // Empty
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void): void {
        this.context = context;
        this.notifyOutputChanged = notifyOutputChanged;
        this.currentXml = context.parameters.fetchxml?.raw ?? "";
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     * @returns ReactElement root react element for the control
     */
    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        this.context = context;

        const allowedEntities = parseAllowedEntities(context.parameters.allowedEntities?.raw);
        const { placeholders, error: placeholdersError } = parsePlaceholderConfig(context.parameters.placeholders?.raw);
        const { requiredFields, error: requiredFieldsError } = parseRequiredFields(context.parameters.requiredAttributes?.raw);
        const { requiredAliases, error: requiredAliasesError } = parseRequiredAliases(context.parameters.requiredAlias?.raw);

        const props: IFetchXmlDesignerProps = {
            initialXml: this.currentXml,
            allowedEntities,
            placeholders,
            placeholdersError,
            requiredFields,
            requiredFieldsError,
            requiredAliases,
            requiredAliasesError,
            onChange: this.handleXmlChange,
            getAllEntities: this.getAllEntities,
            getAttributes: this.getAttributes,
            getRelationships: this.getRelationships,
            pickLookup: this.pickLookup,
            resolveImpersonationUser: this.resolveImpersonationUser,
            resolveLookupLabel: this.resolveLookupLabel,
            openRecord: this.openRecord,
            runQuery: this.runQuery,
        };

        return React.createElement(FetchXmlDesigner, props);
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return { fetchxml: this.currentXml };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }

    // Stable function references (class field arrow functions), so React effects that depend on
    // them don't re-fire on every updateView - they always read the latest this.context at call time.

    private handleXmlChange = (xml: string): void => {
        this.currentXml = xml;
        this.notifyOutputChanged();
    };

    private getAllEntities = (): ReturnType<typeof getAllEntityNames> => {
        return getAllEntityNames();
    };

    private getAttributes = (entityName: string): ReturnType<typeof getEntityAttributes> => {
        return getEntityAttributes(entityName);
    };

    private getRelationships = (entityName: string): ReturnType<typeof getEntityRelationships> => {
        return getEntityRelationships(entityName);
    };

    private pickLookup = (entityTypes: string[]): ReturnType<typeof pickLookupValue> => {
        return pickLookupValue(this.context, entityTypes);
    };

    private resolveImpersonationUser = (systemUserId: string): ReturnType<typeof getUserAadObjectId> => {
        return getUserAadObjectId(this.context, systemUserId);
    };

    private resolveLookupLabel = (entityTypes: string[], id: string): ReturnType<typeof resolveRecordLabel> => {
        return resolveRecordLabel(this.context, entityTypes, id);
    };

    private openRecord = (entityName: string, id: string): ReturnType<typeof openRecordInDialog> => {
        return openRecordInDialog(this.context, entityName, id);
    };

    private runQuery = (entityName: string, fetchXmlString: string, impersonateCallerId?: string): ReturnType<typeof runFetchXml> => {
        return runFetchXml(this.context, entityName, fetchXmlString, impersonateCallerId);
    };
}
