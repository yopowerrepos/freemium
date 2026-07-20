import * as React from "react";
import { IAttributeMetadata } from "../services/metadataService";
import { useDesignerContext } from "./designerContext";

export interface IEntityAttributesState {
    attributes: IAttributeMetadata[];
    loading: boolean;
    error?: string;
}

export function useEntityAttributes(entityName: string): IEntityAttributesState {
    const { getAttributes } = useDesignerContext();
    const [state, setState] = React.useState<IEntityAttributesState>({ attributes: [], loading: false });

    React.useEffect(() => {
        let cancelled = false;
        if (!entityName) {
            setState({ attributes: [], loading: false });
            return undefined;
        }
        setState((s) => ({ ...s, loading: true, error: undefined }));
        getAttributes(entityName)
            .then((attributes) => {
                if (!cancelled) setState({ attributes, loading: false });
                return undefined;
            })
            .catch((e: Error) => {
                if (!cancelled) setState({ attributes: [], loading: false, error: e?.message ?? "Failed to load attribute metadata" });
            });
        return () => {
            cancelled = true;
        };
    }, [entityName, getAttributes]);

    return state;
}

export function findAttribute(attributes: IAttributeMetadata[], logicalName: string): IAttributeMetadata | undefined {
    return attributes.find((a) => a.logicalName.toLowerCase() === logicalName?.toLowerCase());
}
