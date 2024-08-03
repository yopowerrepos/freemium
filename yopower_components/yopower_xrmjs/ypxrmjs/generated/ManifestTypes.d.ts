/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    inputs: ComponentFramework.PropertyTypes.StringProperty;
    label: ComponentFramework.PropertyTypes.StringProperty;
    appearance: ComponentFramework.PropertyTypes.EnumProperty<"primary" | "secondary" | "subtle" | "transparent">;
    shape: ComponentFramework.PropertyTypes.EnumProperty<"rounded" | "circular" | "square">;
    disabled: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    method: ComponentFramework.PropertyTypes.EnumProperty<"0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29" | "30" | "31" | "32" | "33" | "34" | "35" | "36">;
}
export interface IOutputs {
    inputs?: string;
    label?: string;
    appearance?: string;
    shape?: string;
    disabled?: boolean;
    method?: string;
    success?: boolean;
    message?: string;
    data?: string;
}
