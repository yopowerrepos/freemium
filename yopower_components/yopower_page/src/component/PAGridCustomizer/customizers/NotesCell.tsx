import * as React from "react";
import { ColumnDefinition, GetRendererParams } from "../types";
import { Helper } from "../helper";
import { IInputs } from "../generated/ManifestTypes";
import {
    Icon,
    Stack,
    Text,
    Modal
} from "@fluentui/react";

interface NotesCellProps {
    context: ComponentFramework.Context<IInputs>;
    editor: GetRendererParams;
    col: ColumnDefinition;
    props: any;
    definition: any;
    table: string;
    id: string;
}

export const NotesCell: React.FC<NotesCellProps> = ({
    context,
    editor,
    col,
    props,
    definition,
    table,
    id
}) => {
    const params = JSON.parse(definition.parameters);
    const reference = Helper.getFilteredLookupValue(params, table, editor);

    const [value, setValue] = React.useState("0");

    const [isModalOpen, setModalOpen] = React.useState(false);
    const [notes, setNotes] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (reference !== null) {
            executeAggregate(context, reference, params.fetchXmlAggregate)
                .then((_) => {
                    const val = _.entities[0].count.toString() ?? "0";
                    setValue(val);
                })
                .catch((_) => {
                    setValue(_.message);
                });
        }
    }, [context, table, reference]);

    React.useEffect(() => {
        if (isModalOpen && reference !== null) {
            executeQuery(context, reference, params.fetchXml)
                .then((_) => {
                    setNotes(_.entities);
                })
                .catch((error) => {
                    console.error("Error fetching notes:", error);
                });
        }
    }, [isModalOpen]);

    return (
        <div
            style={{
                padding: "4px 8px",
                borderRadius: 2,
                textAlign: "center",
                justifyContent: "center",
                alignItems: "center",
                background: "transparent",
                color: "#000000",
                lineHeight: "20px",
                display: "flex",
                margin: "4px",
                fontWeight: "bold",
                cursor: "pointer"
            }}
            onKeyDown={(e) => { e.preventDefault(); }}
            onClick={(e) => { value !== "0" && setModalOpen(true); }}>
            <Icon iconName={"AddNotes"} style={{ marginRight: 3 }} />
            <div style={{ height: 20 }}>{value}</div>

            <Modal
                isOpen={isModalOpen}
                onDismiss={() => setModalOpen(false)}
                isBlocking={false}
                styles={{
                    main: {
                        position: "fixed",
                        top: 0,
                        right: 0,
                        height: "100%",
                        width: 600,
                        overflowY: "auto",
                        boxShadow: "0 0 10px rgba(0,0,0,0.2)"
                    }
                }}
            >
                <div style={{ padding: 20 }}>
                    {notes.map((note_, index) => (
                        <Stack key={index} tokens={{ childrenGap: 8 }} style={{ border: '1px solid #ddd', marginTop: 10, padding: 10 }}>
                            <Text variant="large">{note_.subject}</Text>
                            <div dangerouslySetInnerHTML={{ __html: note_.notetext }} />
                            <Text>{`Created On: ${note_.createdon} | Created By: ${note_["_createdby_value@OData.Community.Display.V1.FormattedValue"]}`}</Text>
                            <Text>{`Modified On: ${note_.modifiedon} | Modified By: ${note_["_modifiedby_value@OData.Community.Display.V1.FormattedValue"]}`}</Text>
                            {note_.isdocument && <Icon iconName="Attach" />}
                        </Stack>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export function executeAggregate(
    context: ComponentFramework.Context<IInputs>,
    reference: any,
    fetchXmlAggregate: string | null
): Promise<any> {
    if (reference !== null) {

        if (fetchXmlAggregate === null || fetchXmlAggregate === "")
            fetchXmlAggregate = "?fetchXml=<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' aggregate='true'><entity name='annotation'><attribute name='annotationid' aggregate='count' alias='count'/><filter type='and'><condition attribute='objectid' operator='eq' uitype='" + reference.table + "' value='" + reference.id + "'/></filter></entity></fetch>";
        else
            fetchXmlAggregate = "?fetchXml=" + Helper.buildFilter(fetchXmlAggregate, reference);

        return context.webAPI.retrieveMultipleRecords("annotation", fetchXmlAggregate);
    } else {
        return Promise.resolve(null);
    }
}

export function executeQuery(
    context: ComponentFramework.Context<IInputs>,
    reference: any,
    fetchXml: string | null
): Promise<any> {
    if (reference !== null) {

        if (fetchXml === null || fetchXml === "")
            fetchXml = "?fetchXml=<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'><entity name='annotation'><attribute name='annotationid'/><attribute name='subject'/><attribute name='notetext'/><attribute name='createdon'/><attribute name='createdby'/><attribute name='modifiedon'/><attribute name='modifiedby'/><attribute name='isdocument'/><attribute name='filename'/><filter type='and'><condition attribute='objectid' operator='eq' uitype='" + reference.table + "' value='" + reference.id + "'/></filter></entity></fetch>";
        else
            fetchXml = "?fetchXml=" + Helper.buildFilter(fetchXml, reference);

        return context.webAPI.retrieveMultipleRecords("annotation", fetchXml);
    } else {
        return Promise.resolve(null);
    }
}