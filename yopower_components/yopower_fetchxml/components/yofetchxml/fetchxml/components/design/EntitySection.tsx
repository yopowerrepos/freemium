import * as React from "react";
import { Combobox, Option, Field } from "@fluentui/react-components";
import { useDesignerContext } from "../designerContext";
import { SCROLLABLE_LISTBOX, POPUP_FIELD_PROPS, COMPACT_HEIGHT_STYLE } from "./treeStyles";

export interface IEntitySectionProps {
    label: string;
    value: string;
    onChange: (name: string) => void;
}

export const EntitySection: React.FC<IEntitySectionProps> = ({ label, value, onChange }) => {
    const { allowedEntities, getAllEntities } = useDesignerContext();
    // No allowedEntities configured means unrestricted - fall back to every table instead of an empty list.
    const unrestricted = allowedEntities.length === 0;
    const [allEntities, setAllEntities] = React.useState<string[]>([]);
    const [loadingAll, setLoadingAll] = React.useState(false);

    React.useEffect(() => {
        if (!unrestricted) return undefined;
        let cancelled = false;
        setLoadingAll(true);
        getAllEntities()
            .then((names) => {
                if (!cancelled) {
                    setAllEntities(names);
                    setLoadingAll(false);
                }
                return undefined;
            })
            .catch(() => {
                if (!cancelled) {
                    setAllEntities([]);
                    setLoadingAll(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [unrestricted, getAllEntities]);

    const options = unrestricted ? allEntities : allowedEntities;
    const filtered = options.filter((name) => !value || name.toLowerCase().includes(value.toLowerCase()));
    return (
        <Field label={label}>
            <Combobox
                {...POPUP_FIELD_PROPS}
                freeform
                placeholder={unrestricted && loadingAll ? "Loading entities..." : "Entity logical name"}
                value={value}
                selectedOptions={value ? [value] : []}
                onOptionSelect={(_, data) => onChange(data.optionValue ?? "")}
                onChange={(e) => onChange((e.target as HTMLInputElement).value)}
                listbox={SCROLLABLE_LISTBOX}
                style={COMPACT_HEIGHT_STYLE}
            >
                {filtered.map((name) => (
                    <Option key={name} value={name}>
                        {name}
                    </Option>
                ))}
            </Combobox>
        </Field>
    );
};
