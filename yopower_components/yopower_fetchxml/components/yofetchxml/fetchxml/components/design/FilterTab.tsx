import * as React from "react";
import { IFetchXmlQuery } from "../../models/fetchXmlModel";
import { FilterGroupEditor } from "./FilterGroupEditor";

export interface IFilterTabProps {
    query: IFetchXmlQuery;
    onChange: React.Dispatch<React.SetStateAction<IFetchXmlQuery>>;
}

export const FilterTab: React.FC<IFilterTabProps> = ({ query, onChange }) => {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "6px 0" }}>
            <FilterGroupEditor
                filter={query.filter}
                entityName={query.entityName}
                onChange={(filter) => onChange((prev) => ({ ...prev, filter }))}
                linkEntities={query.linkEntities}
                onLinkEntitiesChange={(linkEntities) => onChange((prev) => ({ ...prev, linkEntities }))}
                allowEntityAlias
            />
        </div>
    );
};
