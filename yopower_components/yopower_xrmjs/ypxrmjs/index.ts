import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { XrmJsButton, IXrmJsButtonProps } from "./XrmJsButton";
import * as React from "react";

declare let Xrm: any;

export class ypxrmjs implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private _context: ComponentFramework.Context<IInputs>;
    private _return: IOutputs;
    private notifyOutputChanged: () => void;
    private onSelect: () => void;
    private _successWithoutReturn: IOutputs;
    private _apmNotFound: IOutputs;
    private _sessionNotFound: IOutputs;
    private _tabNotFound: IOutputs;
    private _isInitialized: number = 0;

    constructor() {

        this._successWithoutReturn = {
            success: true,
            message: '',
            data: ''
        }

        this._apmNotFound = {
            success: false,
            message: "❌(window.parent as any).Microsoft.Apm not found!",
            data: undefined
        }

        this._sessionNotFound = {
            success: false,
            message: "❌Session not found!",
            data: undefined
        }

        this._sessionNotFound = {
            success: false,
            message: "Tab not found!",
            data: undefined
        }

    }

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary): void {
        this._context = context;
        this.notifyOutputChanged = notifyOutputChanged;
        // this._context.events.OnSelect = () => {
        //     this.onClick()
        //         .then((_) => {
        //             this._return = _;
        //             this.notifyOutputChanged();
        //         });
        // }
    }

    // OnChange
    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        this._context = context;
        const props: IXrmJsButtonProps = {
            label: this._context.parameters.label!.raw,
            disabled: this._context.parameters.disabled!.raw,
            appearance: this._context.parameters.appearance!.raw,
            shape: this._context.parameters.shape!.raw,
            handler: () => {
                this.onClick()
                    .then((_) => {
                        this._return = _;
                        this.notifyOutputChanged();
                    });
            }
        };
        return React.createElement(
            XrmJsButton, props
        );
    }

    private async onClick(): Promise<IOutputs> {

        try {
            const method = this._context.parameters.method!.raw;
            const inputs = this._context.parameters.inputs!.raw ? this._context.parameters.inputs!.raw!.replace(/[']/g, '"') : null;
            let outputs: IOutputs = {};
            switch (method) {
                case "1": outputs = await this.navigateTo(inputs!); break;
                case "2": outputs = await this.openAlertDialog(inputs!); break;
                case "3": outputs = await this.openConfirmDialog(inputs!); break;
                case "4": outputs = await this.openErrorDialog(inputs!); break;
                case "5": outputs = await this.openFile(inputs!); break;
                case "6": outputs = await this.openForm(inputs!); break;
                case "7": outputs = await this.openUrl(inputs!); break;
                case "8": outputs = await this.openWebResource(inputs!); break;
                case "9": outputs = await this.showProgressIndicator(inputs!); break;
                case "10": outputs = this.closeProgressIndicator(); break;
                case "11": outputs = await this.lookupObjects(inputs!); break;
                case "12": outputs = await this.createPane(inputs!); break;
                case "13": outputs = await this.getAllPanes(); break;
                case "14": outputs = await this.getPane(inputs!); break;
                case "15": outputs = await this.getSelectedPane(); break;
                case "16": outputs = this.getFocusedSession(); break;
                case "17": outputs = this.getAllSessions(); break;
                case "18": outputs = this.getSession(inputs); break;
                case "19": outputs = await this.createSession(inputs!); break;
                case "20": outputs = this.canCreateSession(); break;
                case "21": outputs = this.closeSession(inputs); break;
                case "22": outputs = this.focusSession(inputs); break;
                case "23": outputs = this.requestFocusSession(inputs); break;
                case "24": outputs = this.getFocusedTab(inputs); break;
                case "25": outputs = this.getAllTabs(inputs); break;
                case "26": outputs = this.getTab(inputs); break;
                case "27": outputs = await this.createTab(inputs!); break;
                case "28": outputs = this.canCreateTab(inputs); break;
                case "29": outputs = this.closeTab(inputs); break;
                case "30": outputs = this.focusTab(inputs); break;
                case "31": outputs = this.refreshTab(inputs); break;
                case "32": outputs = await this.setContext(inputs); break;
                case "33": outputs = await this.updateContext(inputs); break;
                case "34": outputs = await this.getContext(inputs); break;
                case "35": outputs = await this.deleteContext(inputs); break;
                case "36": outputs = await this.resolveSlug(inputs); break;
            }
            return outputs;
        } catch (_: any) {
            return {
                success: false,
                message: _.message,
                data: undefined
            }
        }
    }

    public getOutputs(): IOutputs {
        this._context.events.OnOut();
        return this._return;
    }

    public destroy(): void {
    }

    private async navigateTo(params: string): Promise<IOutputs> {
        const json = JSON.parse(params);
        return await Xrm.Navigation.navigateTo(json.pageInput, json.navigationOptions).then(
            (_: any) => {
                if (_ !== null && _.savedEntityReference !== null && _.savedEntityReference.length === 1) {
                    return {
                        success: true,
                        message: '',
                        data: {
                            id: _.savedEntityReference[0].id,
                            name: _.savedEntityReference[0].name
                        }
                    }
                }
                else
                    return this._successWithoutReturn
            },
            (_: any) => {
                return {
                    success: false,
                    message: _.message,
                    data: undefined
                }
            }
        );
    }
    private async openAlertDialog(params: string): Promise<IOutputs> {
        const json = JSON.parse(params);
        return await Xrm.Navigation.openAlertDialog(json.alertStrings, json.alertOptions).then(
            (_: any) => {
                return this._successWithoutReturn
            },
            (_: any) => {
                return {
                    success: false,
                    message: _.message,
                    data: undefined
                }
            }
        );
    }
    private async openConfirmDialog(params: string): Promise<IOutputs> {
        const json = JSON.parse(params);
        return await Xrm.Navigation.openConfirmDialog(json.confirmStrings, json.confirmOptions).then(
            (_: any) => {
                return {
                    success: true,
                    message: '',
                    data: _ ?? _.confirmed
                }
            },
            (_: any) => {
                return {
                    success: false,
                    message: _.message,
                    data: undefined
                }
            }
        );
    }
    private async openErrorDialog(params: string): Promise<IOutputs> {
        const json = JSON.parse(params);
        return await Xrm.Navigation.openErrorDialog(json.errorOptions).then(
            (_: any) => {
                return this._successWithoutReturn
            },
            (_: any) => {
                return {
                    success: false,
                    message: _.message,
                    data: undefined
                }
            }
        );
    }
    private async openFile(params: string): Promise<IOutputs> {
        const json = JSON.parse(params);
        return await Xrm.Navigation.openFile(json.file, json.openFileOptions).then(
            (_: any) => {
                return this._successWithoutReturn
            },
            (_: any) => {
                return {
                    success: false,
                    message: _.message,
                    data: undefined
                }
            }
        );
    }
    private async openForm(params: string): Promise<IOutputs> {
        const json = JSON.parse(params);
        return await Xrm.Navigation.openForm(json.entityFormOptions, json.formParameters).then(
            (_: any) => {
                if (_ !== null && _.savedEntityReference !== null && _.savedEntityReference.length === 1) {
                    return {
                        success: true,
                        message: '',
                        data: {
                            id: _.savedEntityReference[0].id,
                            name: _.savedEntityReference[0].name
                        }
                    }
                }
                else {
                    return {
                        success: true,
                        message: '',
                        data: undefined
                    }
                }
            },
            (_: any) => {
                return {
                    success: false,
                    message: _.message,
                    data:
                    {
                        id: '',
                        name: ''
                    }
                }
            }
        );
    }
    private async openUrl(params: string): Promise<IOutputs> {
        const json = JSON.parse(params);
        return await Xrm.Navigation.openUrl(json.url, json.openUrlOptions).then(
            (_: any) => {
                return this._successWithoutReturn;
            },
            (_: any) => {
                return {
                    success: false,
                    message: _.message,
                    data: undefined
                }
            }
        );
    }
    private async openWebResource(params: string): Promise<IOutputs> {
        const json = JSON.parse(params);
        return await Xrm.Navigation.openWebResource(json.webResourceName, json.windowOptions, json.data).then(
            (_: any) => {
                return this._successWithoutReturn
            },
            (_: any) => {
                return {
                    success: false,
                    message: _.message,
                    data: undefined
                }
            }
        );
    }
    private showProgressIndicator(params: string): IOutputs {
        const json = JSON.parse(params);
        Xrm.Utility.showProgressIndicator(json.message);
        return this._successWithoutReturn
    }
    private closeProgressIndicator(): IOutputs {
        Xrm.Utility.closeProgressIndicator();
        return this._successWithoutReturn;
    }
    private async lookupObjects(params: string): Promise<IOutputs> {
        const json = JSON.parse(params);
        return await Xrm.Utility.lookupObjects(json.lookupOptions).then(
            (_: any) => {
                return {
                    success: true,
                    message: '',
                    data: _
                }
            },
            (_: any) => {
                return {
                    success: false,
                    message: _.message,
                    data: undefined
                }
            }
        );
    }
    private async createPane(params: string): Promise<IOutputs> {
        const json = JSON.parse(params);
        return await Xrm.App.sidePanes.createPane(json.paneOptions).then(
            (_: any) => {
                _.navigate(json.navigate);
                return this._successWithoutReturn;
            },
            (_: any) => {
                return {
                    success: false,
                    message: _.message,
                    data: ''
                }
            }
        );
    }
    private getAllPanes(): IOutputs {
        const panes = Xrm.App.sidePanes.getAllPanes();
        if (panes !== null && panes.getAll() !== null && panes.getAll().length > 0) {
            return {
                success: true,
                message: '',
                data: panes.getAll().map((m: any) => (
                    {
                        paneId: m.paneId,
                        title: m.title,
                        enabled: m.enabled,
                        alwaysRender: m.alwaysRender,
                        isResizable: m.isResizable,
                        badge: m.badge
                    }))
            }
        }
        else {
            return {
                success: false,
                message: '',
                data: undefined
            }
        }
    }
    private getPane(params: string): IOutputs {
        const json = JSON.parse(params);
        const pane = Xrm.App.sidePanes.getPane(json.paneId);
        if (pane !== null) {
            return {
                success: true,
                message: '',
                data: {
                    paneId: pane.paneId,
                    title: pane.title,
                    enabled: pane.enabled,
                    alwaysRender: pane.alwaysRender,
                    isResizable: pane.isResizable,
                    badge: pane.badge
                } as any
            }
        }
        else {
            return {
                success: false,
                message: '',
                data: undefined
            }
        }

    }
    private getSelectedPane(): IOutputs {
        const pane = Xrm.App.sidePanes.getSelectedPane();
        if (pane !== null) {
            return {
                success: true,
                message: '',
                data: {
                    paneId: pane.paneId,
                    title: pane.title,
                    enabled: pane.enabled,
                    alwaysRender: pane.alwaysRender,
                    isResizable: pane.isResizable,
                    badge: pane.badge
                } as any
            }
        }
        else {
            return {
                success: false,
                message: '',
                data: undefined
            }
        }
    }

    // Sessions
    private getFocusedSession(): IOutputs {
        if ((window.parent as any).Microsoft.Apm) {
            const session = (window.parent as any).Microsoft.Apm.getFocusedSession();
            return {
                success: true, message: '', data: session.sessionId
            }
        }
        else
            return this._apmNotFound;
    }
    private getAllSessions(): IOutputs {
        if ((window.parent as any).Microsoft.Apm) {
            const sessions = (window.parent as any).Microsoft.Apm.getAllSessions();
            return {
                success: true, message: '', data: sessions
            }
        }
        else
            return this._apmNotFound;
    }
    private getSession(params: string | null): IOutputs {
        if ((window.parent as any).Microsoft.Apm) {
            const session = params ? (window.parent as any).Microsoft.Apm.getSession(JSON.parse(params).sessionId) : (window.parent as any).Microsoft.Apm.getFocusedSession();
            if (session)
                return {
                    success: true, message: '', data: session
                }
            else
                return this._sessionNotFound;
        }
        else
            return this._apmNotFound
    }
    private async createSession(params: string): Promise<IOutputs> {
        const json = JSON.parse(params);
        const context = new Map();
        context.set("parametersStr", json.parametersStr);
        if ((window.parent as any).Microsoft.Apm) {
            return await (window.parent as any).Microsoft.Apm.createSession({ templateName: json.templateName, sessionContext: context, isFocused: json.isFocused }).then(
                (_: any) => {
                    return {
                        success: true, message: '', data: _
                    }
                },
                (_: any) => {
                    return {
                        success: false, message: _.message, data: ''
                    }
                });
        }
        else
            return this._apmNotFound;
    }
    private canCreateSession(): IOutputs {
        if ((window.parent as any).Microsoft.Apm) {
            return {
                success: true, message: '', data: (window.parent as any).Microsoft.Apm.canCreateSession()
            }
        }
        else
            return this._apmNotFound;
    }
    private closeSession(params: string | null): IOutputs {
        if ((window.parent as any).Microsoft.Apm) {
            const session = params !== null ? (window.parent as any).Microsoft.Apm.getSession(JSON.parse(params).sessionId) : (window.parent as any).Microsoft.Apm.getFocusedSession();
            if (session) {
                session.close();
                return this._successWithoutReturn;
            }
            else
                return this._sessionNotFound;
        }
        else
            return this._apmNotFound;
    }
    private focusSession(params: string | null): IOutputs {
        if ((window.parent as any).Microsoft.Apm) {
            const session = params !== null ? (window.parent as any).Microsoft.Apm.getSession(JSON.parse(params).sessionId) : (window.parent as any).Microsoft.Apm.getFocusedSession();
            if (session) {
                session.focus();
                return this._successWithoutReturn;
            }
            else
                return this._sessionNotFound;
        }
        else
            return this._apmNotFound;
    }
    private requestFocusSession(params: string | null): IOutputs {
        if ((window.parent as any).Microsoft.Apm) {
            const session = params !== null ? (window.parent as any).Microsoft.Apm.getSession(JSON.parse(params).sessionId) : (window.parent as any).Microsoft.Apm.getFocusedSession();
            if (session) {
                session.requestFocus();
                return this._successWithoutReturn;
            }
            else
                return this._sessionNotFound;
        }
        else
            return this._apmNotFound;
    }

    // Tabs
    private getFocusedTab(params: string | null): IOutputs {
        if ((window.parent as any).Microsoft.Apm) {
            const session = params !== null ? (window.parent as any).Microsoft.Apm.getSession(JSON.parse(params).sessionId) : (window.parent as any).Microsoft.Apm.getFocusedSession();
            if (session)
                return {
                    success: true, message: '', data: session.getFocusedTab()
                }
            else
                return this._sessionNotFound;
        }
        else
            return this._apmNotFound;
    }
    private getAllTabs(params: string | null): IOutputs {
        if ((window.parent as any).Microsoft.Apm) {
            const session = params !== null ? (window.parent as any).Microsoft.Apm.getSession(JSON.parse(params).sessionId) : (window.parent as any).Microsoft.Apm.getFocusedSession();
            if (session)
                return {
                    success: true, message: '', data: session.getAllTabs()
                }
            else
                return this._sessionNotFound;
        }
        else
            return this._apmNotFound;
    }
    private getTab(params: string | null): IOutputs {
        if (params !== null) {
            const json = JSON.parse(params);
            if ((window.parent as any).Microsoft.Apm) {
                const session = json.sessionId !== null ? (window.parent as any).Microsoft.Apm.getSession(json.sessionId) : (window.parent as any).Microsoft.Apm.getFocusedSession();
                if (session) {
                    const tab = json.tabId ? session.getTab(json.tabId) : session.getFocusedTab();
                    if (tab)
                        return {
                            success: true, message: '', data: tab
                        }
                    else
                        return this._tabNotFound;
                }
                else
                    return this._sessionNotFound;
            }
            else
                return this._apmNotFound;
        }
        else
            return {
                success: false,
                message: "❌sessionId and tabId are required"
            }
    }
    private canCreateTab(params: string | null): IOutputs {
        if ((window.parent as any).Microsoft.Apm) {
            const session = params !== null ? (window.parent as any).Microsoft.Apm.getSession(JSON.parse(params).sessionId) : (window.parent as any).Microsoft.Apm.getFocusedSession();
            if (session)
                return {
                    success: true, message: '', data: session.canCreateTab()
                }
            else
                return this._sessionNotFound;
        }
        else
            return this._apmNotFound;
    }
    private async createTab(params: string): Promise<IOutputs> {
        if (params) {
            const json = JSON.parse(params);
            const context = new Map();
            let input: any = null;
            switch (json.type) {
                // Entity
                case "entity":
                    context.set("entityName", json.entityName);
                    context.set("entityId", json.entityId);
                    input = { templateName: "msdyn_entityrecord", appContext: context, isFocused: json.isFocused };
                    break;

                // Entity
                case "newentity":
                    context.set("entityName", json.entityName);
                    context.set("formId", json.formId);
                    context.set("data", JSON.stringify(json.params));
                    input = { templateName: "msdyn_entityrecord", appContext: context, isFocused: json.isFocused };
                    break;

                // Web Resource
                case "webresource":
                    if (json.data) {
                        context.set("data", json.value);
                        context.set("webresourceName", json.webResourceName + ".html");
                        input = { templateName: json.webResourceName, appContext: context, isFocused: json.isFocused };
                    }
                    else {
                        context.set("webresourceName", json.webResourceName + ".html");
                        input = { templateName: "webresource", appContext: context, isFocused: json.isFocused };
                    }
                    break;
            }

            if (input) {
                if ((window.parent as any).Microsoft.Apm) {
                    const session = json.sessionId !== null ? (window.parent as any).Microsoft.Apm.getSession(json.sessionId) : (window.parent as any).Microsoft.Apm.getFocusedSession();
                    return await session.createTab(input).then(
                        (_: any) => {
                            return {
                                success: true, message: '', data: _
                            }
                        },
                        (_: any) => {
                            return {
                                success: false, message: _.message, data: ''
                            }
                        });
                }
                else
                    return this._apmNotFound;
            }
            else
                return {
                    success: false,
                    message: "Type not found",
                    data: undefined
                }
        }
        else
            return {
                success: false,
                message: "❌Required params: \r\n- entityName:string, entityId:string, isFocused:bool \r\n- entityName:string, formId:string, ,params:{}, isFocused:bool \r\n- webResourceName:string, value:string, isFocused:bool"
            }
    }
    private closeTab(params: string | null): IOutputs {
        if (params) {
            const json = JSON.parse(params);
            if ((window.parent as any).Microsoft.Apm) {
                const session = json.sessionId !== null ? (window.parent as any).Microsoft.Apm.getSession(json.sessionId) : (window.parent as any).Microsoft.Apm.getFocusedSession();
                if (session) {
                    const tab = json.tabId ? session.getTab(json.tabId) : session.getFocusedTab();
                    if (tab) {
                        tab.close();
                        return this._successWithoutReturn;
                    }
                    else
                        return this._tabNotFound;
                }
                else
                    return this._sessionNotFound;
            }
            else
                return this._apmNotFound;
        }
        else
            return {
                success: false,
                message: "❌sessionId and tabId are required"
            }
    }
    private focusTab(params: string | null): IOutputs {
        if (params) {
            const json = JSON.parse(params);
            if ((window.parent as any).Microsoft.Apm) {
                const session = json.sessionId !== null ? (window.parent as any).Microsoft.Apm.getSession(json.sessionId) : (window.parent as any).Microsoft.Apm.getFocusedSession();
                if (session) {
                    const tab = json.tabId ? session.getTab(json.tabId) : session.getFocusedTab();
                    if (tab) {
                        tab.focus();
                        return this._successWithoutReturn;
                    }
                    else
                        return this._tabNotFound;
                }
                else
                    return this._sessionNotFound;
            }
            else
                return this._apmNotFound;
        }
        else
            return {
                success: false,
                message: "❌sessionId and tabId are required"
            }
    }
    private refreshTab(params: string | null): IOutputs {
        if (params) {
            const json = JSON.parse(params);
            if ((window.parent as any).Microsoft.Apm) {
                const session = json.sessionId !== null ? (window.parent as any).Microsoft.Apm.getSession(json.sessionId) : (window.parent as any).Microsoft.Apm.getFocusedSession();
                if (session) {
                    const tab = json.tabId ? session.getTab(json.tabId) : session.getFocusedTab();
                    if (tab) {
                        tab.refresh();
                        return this._successWithoutReturn;
                    }
                    else
                        return this._tabNotFound;
                }
                else
                    return this._sessionNotFound;
            }
            else
                return this._apmNotFound;
        }
        else
            return {
                success: false,
                message: "❌sessionId and tabId are required"
            }
    }

    // Context
    private async setContext(params: string | null): Promise<IOutputs> {
        if (params) {
            const json = JSON.parse(params);
            if ((window.parent as any).Microsoft.Apm) {
                const session = json.sessionId !== null ? (window.parent as any).Microsoft.Apm.getSession(json.sessionId) : (window.parent as any).Microsoft.Apm.getFocusedSession();
                if (session) {
                    const context = await session.getContext();
                    context.set(json.key, json.value);
                    return this._successWithoutReturn;
                }
                else
                    return this._sessionNotFound;
            }
            else
                return this._apmNotFound;
        }
        else
            return {
                success: false,
                message: "❌sessionId, key and value are required"
            }
    }
    private async updateContext(params: string | null): Promise<IOutputs> {
        if (params) {
            const json = JSON.parse(params);
            if ((window.parent as any).Microsoft.Apm) {
                const session = json.sessionId !== null ? (window.parent as any).Microsoft.Apm.getSession(json.sessionId) : (window.parent as any).Microsoft.Apm.getFocusedSession();
                if (session) {
                    await session.updateContext(json.context);
                    return this._successWithoutReturn;
                }
                else
                    return this._sessionNotFound;
            }
            else
                return this._apmNotFound;
        }
        else
            return {
                success: false,
                message: "❌sessionId and context are required"
            }
    }
    private async getContext(params: string | null): Promise<IOutputs> {
        if (params) {
            const json = JSON.parse(params);
            if ((window.parent as any).Microsoft.Apm) {
                const session = json.sessionId !== null ? (window.parent as any).Microsoft.Apm.getSession(json.sessionId) : (window.parent as any).Microsoft.Apm.getFocusedSession();
                if (session) {
                    const context = await session.getContext();
                    return {
                        success: true,
                        message: '',
                        data: context.get(json.key)
                    }
                }
                else
                    return this._sessionNotFound;
            }
            else
                return this._apmNotFound;
        }
        else
            return {
                success: false,
                message: "❌sessionId and key are required"
            }
    }
    private async deleteContext(params: string | null): Promise<IOutputs> {
        if (params) {
            const json = JSON.parse(params);
            if ((window.parent as any).Microsoft.Apm) {
                const session = json.sessionId !== null ? (window.parent as any).Microsoft.Apm.getSession(json.sessionId) : (window.parent as any).Microsoft.Apm.getFocusedSession();
                if (session) {
                    const context = await session.getContext();
                    context.delete(json.key);
                    return this._successWithoutReturn;
                }
                else
                    return this._sessionNotFound;
            }
            else
                return this._apmNotFound;
        }
        else
            return {
                success: false,
                message: "❌sessionId and key are required"
            }
    }
    private resolveSlug(params: string | null): IOutputs {
        if (params) {
            const json = JSON.parse(params);
            if ((window.parent as any).Microsoft.Apm) {
                const session = json.sessionId !== null ? (window.parent as any).Microsoft.Apm.getSession(json.sessionId) : (window.parent as any).Microsoft.Apm.getFocusedSession();
                if (session) {
                    return {
                        success: true,
                        message: '',
                        data: session.resolveSlug(json.slug)
                    }
                }
                else
                    return this._sessionNotFound;
            }
            else
                return this._apmNotFound;
        }
        else
            return {
                success: false,
                message: "❌sessionId and slug are required"
            }
    }
}