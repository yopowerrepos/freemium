import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { Helper } from "../helper";
import { IInputs } from "../generated/ManifestTypes";
import { Icon } from "@fluentui/react/lib/components/Icon/Icon";
import { _902AnyRelatedRecords } from "../models/customizers/_902AnyRelatedRecords";

export const AnyRelatedRecords: React.FC<ICell> = (cell) => {
    const params = JSON.parse(cell.definition.parameters) as _902AnyRelatedRecords;
    const rules = params.rules;

    const reference = Helper.getFilteredLookupValue(params, cell.table, cell.params);

    const [value, setValue] = React.useState("0");
    const [background, setBackground] = React.useState("transparent");
    const [color, setColor] = React.useState("transparent");
    const [icon, setIcon] = React.useState<string | undefined>(undefined);

    if (reference !== null)
        React.useEffect(() => {
            executeAggregate(cell.context, params.table, reference, params.fetchXmlAggregate)
                .then((_) => {
                    const val = _.entities[0].value.toString() ?? "0";
                    setValue(val);
                    const matchedRule = rules.find(r => r.min <= +val && r.max >= +val);
                    setBackground(matchedRule?.background ?? "transparent");
                    setColor(matchedRule?.color ?? "transparent");
                    setIcon(matchedRule?.icon); // <== Set icon if it exists
                })
                .catch((_) => {
                    setValue(_.message);
                    setBackground("transparent");
                    setColor("transparent");
                    setIcon(undefined); // reset icon on error
                });
        }, [cell.context, cell.table, reference, params.fetchXmlAggregate, rules]);

    return (
        <div
            style={{
                padding: "4px 8px",
                borderRadius: 2,
                textAlign: "center",
                justifyContent: "center",
                alignItems: "center",
                background: background,
                color: color,
                lineHeight: "20px",
                display: "flex",
                margin: "4px",
                fontWeight: "bold",
                cursor: "pointer"
            }}
            onKeyDown={(e) => { e.preventDefault() }}
            onClick={(e) => { upsertPageManagedUserQuery(cell.context, params.viewName, params.table, reference, params.fetchXml, params.layoutXml) }}>
            <Icon iconName={icon} style={{ marginRight: 3 }} />
            <div style={{ height: 20 }}>
                {value}
            </div>
        </div>
    );
}

export function executeAggregate(
    context: ComponentFramework.Context<IInputs>,
    table: string,
    reference: any,
    fetchXmlAggregate: string
): Promise<any> {
    if (reference !== null) {
        fetchXmlAggregate = "?fetchXml=" + Helper.buildFilter(fetchXmlAggregate, reference);
        return context.webAPI.retrieveMultipleRecords(table, fetchXmlAggregate);
    } else {
        return Promise.resolve(null);
    }
}

export async function upsertPageManagedUserQuery(context: ComponentFramework.Context<IInputs>, name: string, table: string, reference: string, fetchXml: string, layoutXml: string): Promise<void> {
    const tag = "[Managed PAGE " + table + "]";
    fetchXml = Helper.buildFilter(fetchXml, reference);
    const viewId = await context.webAPI.retrieveMultipleRecords("userquery", "?$select=userqueryid&$filter=description eq '" + tag + "'").then(
        async (r: ComponentFramework.WebApi.RetrieveMultipleResponse) => {
            if (r.entities.length >= 1) {
                const id = r.entities[0]["userqueryid"];
                return await updateView(context, name, id, fetchXml, layoutXml).then(
                    (_) => { return id }
                );
            }
            else
                return await createView(context, name, tag, table, fetchXml, layoutXml);
        });
    Helper.navigateToViewModal(table, viewId);
}

export async function createView(context: ComponentFramework.Context<IInputs>, name: string, tag: string, table: string, fetchXml: string, layoutXml: string): Promise<string> {
    var columns: any = {};
    columns["name"] = name;
    columns["description"] = tag;
    columns["querytype"] = 0;
    columns["returnedtypecode"] = table;
    columns["fetchxml"] = fetchXml;
    columns["layoutxml"] = layoutXml;
    return await context.webAPI.createRecord("userquery", columns).then((r: ComponentFramework.LookupValue) => {
        return r.id;
    });
}

export async function updateView(context: ComponentFramework.Context<IInputs>, name: string, id: string, fetchXml: string, layoutXml: string): Promise<void> {
    var columns: any = {};
    columns["name"] = name;
    columns["fetchxml"] = fetchXml;
    columns["layoutxml"] = layoutXml;
    return await context.webAPI.updateRecord("userquery", id, columns).then((r: ComponentFramework.LookupValue) => {
        return;
    });
}