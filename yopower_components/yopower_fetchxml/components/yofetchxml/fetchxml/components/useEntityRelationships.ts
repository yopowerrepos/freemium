import * as React from "react";
import { IRelationshipOption } from "../services/metadataService";
import { useDesignerContext } from "./designerContext";

export interface IEntityRelationshipsState {
    relationships: IRelationshipOption[];
    loading: boolean;
    error?: string;
}

export function useEntityRelationships(entityName: string): IEntityRelationshipsState {
    const { getRelationships } = useDesignerContext();
    const [state, setState] = React.useState<IEntityRelationshipsState>({ relationships: [], loading: false });

    React.useEffect(() => {
        let cancelled = false;
        if (!entityName) {
            setState({ relationships: [], loading: false });
            return undefined;
        }
        setState((s) => ({ ...s, loading: true, error: undefined }));
        getRelationships(entityName)
            .then((result) => {
                if (!cancelled) setState({ relationships: result.relationships, loading: false, error: result.error });
                return undefined;
            })
            .catch((e: Error) => {
                if (!cancelled) setState({ relationships: [], loading: false, error: e?.message ?? "Failed to load relationship metadata" });
            });
        return () => {
            cancelled = true;
        };
    }, [entityName, getRelationships]);

    return state;
}
