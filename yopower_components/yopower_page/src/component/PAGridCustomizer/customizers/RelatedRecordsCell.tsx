import * as React from "react";
import { ColumnDefinition, GetRendererParams } from "../types";
import { Helper } from "../helper";
import { IInputs } from "../generated/ManifestTypes";

interface RelatedRecordsCellProps {
    context: ComponentFramework.Context<IInputs>;
    editor: GetRendererParams;
    col: ColumnDefinition;
    props: any;
    definition: any;
    table: string;
    id: string;
}

export const RelatedRecordsCell: React.FC<RelatedRecordsCellProps> = ({
    context,
    editor,
    col,
    props,
    definition,
    table,
    id
}) => {
    const params = JSON.parse(definition.parameters);
    const background = params.background ?? "transparent";
    const color = params.color ?? "black";
    const reference = Helper.getFilteredLookupValue(params, table, editor);

    const [value, setValue] = React.useState<string>("0");

    React.useEffect(() => {
        executeAggregate(context, params.table, reference, params.fetchXmlAggregate)
            .then(
                (_) => setValue(_.entities[0].value.toString() ?? "0"))
            .catch(
                (_) => setValue(_.message)
            );
    }, [context, table, reference, params.fetchXmlAggregate]);

    return (
        <div
            style={{
                padding: "4px 8px",
                borderRadius: 2,
                textAlign: "center",
                background: background,
                color: color,
                lineHeight: "20px",
                display: "flex",
                margin: "4px"
            }}
            onClick={(e) => { upserPageManagedUserQuery(context, params.table, reference, params.fetchXml, params.layoutXml) }}>
            {value}
        </div>
    );
};

export function executeAggregate(
    context: ComponentFramework.Context<IInputs>,
    table: string,
    reference: string,
    fetchXmlAggregate: string
): Promise<any> {
    if (reference !== null) {
        fetchXmlAggregate = "?fetchXml=" + Helper.buildFilter(fetchXmlAggregate, reference);
        return context.webAPI.retrieveMultipleRecords(table, fetchXmlAggregate);
    } else {
        return Promise.resolve(null);
    }
}

export async function upserPageManagedUserQuery(context: ComponentFramework.Context<IInputs>, table: string, reference: string, fetchXml: string, layoutXml: string): Promise<void> {
    const tag = "[Managed PAGE " + table + "]";
    fetchXml = Helper.buildFilter(fetchXml, reference);
    const viewId = await context.webAPI.retrieveMultipleRecords("userquery", "?$select=userqueryid&$filter=description eq '" + tag + "'").then(
        async (r: ComponentFramework.WebApi.RetrieveMultipleResponse) => {
            if (r.entities.length >= 1) {
                const id = r.entities[0]["userqueryid"];
                return await updateView(context, id, fetchXml, layoutXml).then(
                    (_) => { return id }
                );
            }
            else
                return await createView(context, tag, table, fetchXml, layoutXml);
        });
    Helper.navigateToViewModal(table, viewId);
}

export async function createView(context: ComponentFramework.Context<IInputs>, tag: string, table: string, fetchXml: string, layoutXml: string): Promise<string> {
    var columns: any = {};
    columns["name"] = "Custom View Managed by PAGE";
    columns["description"] = tag;
    columns["querytype"] = 0;
    columns["returnedtypecode"] = table;
    columns["fetchxml"] = fetchXml;
    columns["layoutxml"] = layoutXml;
    return await context.webAPI.createRecord("userquery", columns).then((r: ComponentFramework.LookupValue) => {
        return r.id;
    });
}

export async function updateView(context: ComponentFramework.Context<IInputs>, id: string, fetchXml: string, layoutXml: string): Promise<void> {
    var columns: any = {};
    columns["fetchxml"] = fetchXml;
    columns["layoutxml"] = layoutXml;
    return await context.webAPI.updateRecord("userquery", id, columns).then((r: ComponentFramework.LookupValue) => {
        return;
    });
}