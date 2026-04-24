import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { IInputs } from "../generated/ManifestTypes";
import { Helper } from "../helper";
import { Icon, Stack, Text, Modal } from "@fluentui/react";
import { FluentProvider, IdPrefixProvider, Popover, PopoverSurface, PopoverTrigger, webLightTheme } from "@fluentui/react-components";
import { _906AnyNotes } from "../models/customizers/_906AnyNotes";

export const AnyNotes: React.FC<ICell> = (cell) => {
    const params = JSON.parse(cell.definition.parameters) as _906AnyNotes;
    const reference = Helper.getFilteredLookupValue(params, cell.table, cell.params);

    const [value, setValue] = React.useState("0");

    const [isModalOpen, setModalOpen] = React.useState(false);
    const [notes, setNotes] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (!reference) return;
        executeAggregate(cell.context, reference, params.fetchXmlAggregate)
            .then((res) => {
                const val = res.entities[0]?.count?.toString() ?? "0";
                setValue(val);
            })
            .catch((e) => setValue(e.message));
    }, [reference?.id]);

    React.useEffect(() => {
        if (!params.popUpLastModified) return;
        if (!reference) return;
        if (value === "0") return;

        executeQuery(cell.context, reference, params.fetchXml)
            .then((res) => setNotes(res.entities))
            .catch(console.error);
    }, [value, reference?.id]);

    React.useEffect(() => {
        if (isModalOpen && reference !== null) {
            executeQuery(cell.context, reference, params.fetchXml)
                .then((_) => {
                    setNotes(_.entities);
                })
                .catch((error) => {
                    console.error("Error fetching notes:", error);
                });
        }
    }, [isModalOpen]);

    return (
        params.popUpLastModified
            ? (<div
                style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    paddingLeft: "5px"
                }}
            >
                <IdPrefixProvider value={cell.table + cell.id + cell.col.colId}>
                    <FluentProvider theme={webLightTheme}>
                        <Popover withArrow>
                            <PopoverTrigger disableButtonEnhancement>
                                <div style={{ background: "transparent", width: 0 }}>
                                    {
                                        new DOMParser()
                                            .parseFromString(notes !== null && notes.length > 0 ? notes[0].notetext : "", "text/html")
                                            .body.textContent
                                    }
                                </div>
                            </PopoverTrigger>
                            <PopoverSurface tabIndex={-1}>
                                <div
                                    style={{ marginTop: 0 }}
                                    dangerouslySetInnerHTML={{ __html: notes !== null && notes.length > 0 ? notes[0].notetext : "" }}
                                />
                            </PopoverSurface>
                        </Popover>
                    </FluentProvider>
                </IdPrefixProvider>
            </div>)
            : (
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
                </div>)
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
            fetchXml = "?fetchXml=<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'><entity name='annotation'><attribute name='annotationid'/><attribute name='subject'/><attribute name='notetext'/><attribute name='createdon'/><attribute name='createdby'/><attribute name='modifiedon'/><attribute name='modifiedby'/><attribute name='isdocument'/><attribute name='filename'/><order attribute='modifiedon' descending='true' /><filter type='and'><condition attribute='objectid' operator='eq' uitype='" + reference.table + "' value='" + reference.id + "'/></filter></entity></fetch>";
        else
            fetchXml = "?fetchXml=" + Helper.buildFilter(fetchXml, reference);

        return context.webAPI.retrieveMultipleRecords("annotation", fetchXml);
    } else {
        return Promise.resolve(null);
    }
}