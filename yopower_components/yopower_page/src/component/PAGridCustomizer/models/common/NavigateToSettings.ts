import { NavigateToSize } from "./NavigateToSize";

export interface NavigateToSettings {
    position: number;
    formId: string;
    tabName?: string;
    label: string;
    height: NavigateToSize;
    width: NavigateToSize;
}