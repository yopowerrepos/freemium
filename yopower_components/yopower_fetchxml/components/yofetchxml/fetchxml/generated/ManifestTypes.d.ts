/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    fetchxml: ComponentFramework.PropertyTypes.StringProperty;
    placeholders: ComponentFramework.PropertyTypes.StringProperty;
    allowedEntities: ComponentFramework.PropertyTypes.StringProperty;
    requiredAttributes: ComponentFramework.PropertyTypes.StringProperty;
    requiredAlias: ComponentFramework.PropertyTypes.StringProperty;
}
export interface IOutputs {
    fetchxml?: string;
}
