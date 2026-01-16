import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { Helper } from "../helper";
import { IInputs } from "../generated/ManifestTypes";
import { TimelineItem } from "../models/common/TimelineItem";
import { FontIcon } from "@fluentui/react/lib/components/Icon/FontIcon";
import { _908AnyCustomTimeline } from "../models/customizers/_908AnyCustomTimeline";

export const AnyCustomTimeline: React.FC<ICell> = (cell) => {
    const params = JSON.parse(cell.definition.parameters) as _908AnyCustomTimeline;
    const [values, setValues] = React.useState<TimelineItem[]>([]);
    const reference = Helper.getFilteredLookupValue(params, cell.table, cell.params);

    if (reference !== null)
        React.useEffect(() => {
            getItems(cell.context, reference, params)
                .then((_) => {
                    const values = _.sort((a, b) => (a.order < b.order ? -1 : 1));
                    setValues(values);
                })
                .catch((_) => {
                    setValues([]);
                });
        }, [params]);

    return (
        <div
            style={{
                padding: "4px 8px",
                borderRadius: 2,
                textAlign: "left",
                justifyContent: "left",
                alignItems: "flex-start",
                lineHeight: "20px",
                display: "flex",
                margin: "4px",
                fontWeight: "bold",
                gap: "8px",
            }}
            onKeyDown={(e) => { e.preventDefault() }}
        >
            {values.map((v, i) => (
                <div>
                    <FontIcon
                        title={v.title + (v.description ? " - " + v.description : "")}
                        iconName={v.status?.icon || "Record2"}
                        style={{
                            color: v.status?.color || "#000000",
                            cursor: "pointer"
                        }}
                        onClick={(e) => { Helper.navigateToRecordModal(1, v.table, v.id, "00000000-0000-0000-0000-000000000000", undefined, { value: 75, unit: '%' }, { value: 75, unit: '%' }) }}
                    />
                </div>
            ))}
        </div>
    );
}

export async function getItems(
    context: ComponentFramework.Context<IInputs>,
    reference: any,
    params: any
): Promise<TimelineItem[]> {
    if (reference === null) return [];

    const items = (params.items as Array<any>) || [];
    if (items.length === 0) return [];

    // create requests for each rule
    const requests = items.map(i =>
        context.webAPI
            .retrieveMultipleRecords(i.table, "?fetchXml=" + Helper.buildTimelineQuery(i, reference))
            .then(res => ({ item: i, entities: res.entities }))
    );

    // run all requests in parallel and handle failures per-request
    const settled = await Promise.allSettled(requests);

    const values: TimelineItem[] = [];

    settled.forEach(result => {
        if (result.status === "fulfilled" && result.value && result.value.entities && result.value.entities.length > 0) {
            const { item, entities } = result.value;
            entities.forEach(r => {
                let value = {
                    sort: null,
                    order: r[item.orderby],
                    table: item.table,
                    id: r[item.id],
                    title: r[item.title],
                    description: r[item.description],
                    status: {
                        value: r[item.optionset] ?? null,
                        label: r[`${item.optionset}@OData.Community.Display.V1.FormattedValue`] ?? null,
                    }
                } as TimelineItem;
                const rule = matchRule(item.rules, value.status.value);
                if (rule !== null) {
                    value = { ...value, status: { ...value.status, icon: rule.icon, color: rule.color } };
                }
                values.push(value);
            });
        } else if (result.status === "rejected") {
            console.warn("retrieveMultipleRecords failed for a rule:", result.reason);
        }
    });

    return values;
}

export function matchRule(rules: Array<any> | null, value: number | null): any | null {
    if (rules !== null && value !== null) {
        const match = rules.filter(r => r.value === value);
        if (match !== null && match.length === 1)
            return { icon: match[0].icon, color: match[0].color };
        else
            return null;
    }
}