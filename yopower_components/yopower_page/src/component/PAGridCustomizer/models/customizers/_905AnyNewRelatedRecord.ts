import { NavigateToSize } from "../common/NavigateToSize";

    export interface _905AnyNewRelatedRecord {
        options: NewRelatedRecorSettingsModel[];
    }

    export interface NewRelatedRecorSettingsModel {
        label: string;
        formId: string;
        targetTableLogicalName: string;
        useQuickCreateForm: boolean;
        icon?: string;
        height?: NavigateToSize;
        width?: NavigateToSize;
    }
