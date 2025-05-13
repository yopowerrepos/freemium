import * as React from "react";
import { ColumnDefinition, GetEditorParams, GetRendererParams } from "../types";
import { CommandButton, IContextualMenuItem, IContextualMenuProps, Spinner, SpinnerSize } from "@fluentui/react";
import { IInputs } from "../generated/ManifestTypes";
import mime from 'mime';

const fileCellClassName = "page-file-cell";

interface FileCellProps {
    context: ComponentFramework.Context<IInputs>,
    render: GetRendererParams,
    col: ColumnDefinition,
    props: any,
    definition: any,
    table: string,
    id: string,
    goToSettings: (e: any) => void
}

export const FileCell: React.FC<FileCellProps> = ({
    context,
    col,
    props,
    definition,
    table,
    id,
    goToSettings
}) => {

    // Workaround for a bug when the file cell is empty
    const checkElements = () => {
        // Check for elements by class name
        const bugWhenFileIsEmpty = document.getElementsByClassName("ms-Shimmer-shimmerWrapper");
        if (bugWhenFileIsEmpty && bugWhenFileIsEmpty.length > 0) {
            for (let i = 0; i < bugWhenFileIsEmpty.length; i++) {
                (bugWhenFileIsEmpty[i] as HTMLElement).style.display = "none";
            }
        }

        // Check for elements by name
        const fileCells = document.getElementsByClassName(fileCellClassName);
        if (fileCells && fileCells.length > 0) {
            for (let i = 0; i < fileCells.length; i++) {
                (fileCells[i] as HTMLElement).parentElement!.parentElement!.style.display = "contents";
            }
        }

        // Stop interval if both conditions are satisfied
        if (bugWhenFileIsEmpty.length > 0 && fileCells.length > 0) {
            clearInterval(intervalId);
        }
    };

    // Run the combined function every 500ms
    const intervalId = setInterval(checkElements, 500);

    const settings = JSON.parse(definition.parameters) as any;
    const readOnly = settings.readOnly as boolean;
    const [propsValue, setPropsValue] = React.useState<any>(props.value);
    const [loading, setLoading] = React.useState<boolean>(false);

    let items: IContextualMenuItem[] = [];

    if (propsValue.fileUrl !== "") {
        items.push({
            key: "view",
            text: "Visualize",
            iconProps: { iconName: "View" },
            onClick: () => {
                setLoading(true);
                handleFileDownload(context, propsValue.fileUrl)
                    .then((_) => {
                        if (_) {
                            context.navigation.openFile(
                                {
                                    fileContent: _,
                                    fileName: propsValue.fileName,
                                    fileSize: propsValue.fileSize,
                                    mimeType: propsValue.mimeType || mime.getType(propsValue.fileName),
                                },
                                {
                                    openMode: 1
                                });
                        }
                    })
                    .finally(() => setLoading(false));
            },
        });

        items.push({
            key: "download",
            text: "Download",
            iconProps: { iconName: "Download" },
            onClick: () => {
                open(propsValue.fileUrl);
            }
        });
    }

    if (!readOnly) {
        items.push({
            key: "upload",
            text: "Upload / Replace",
            iconProps: { iconName: "Upload" },
            onClick: () => {
                setLoading(true);
                handleFileUpload(context, settings, table, id, col.name, setPropsValue)
                    .finally(() => setLoading(false));
            },
        });
    }

    if (propsValue.fileUrl !== "" && !readOnly) {
        items.push({
            key: "delete",
            text: "Delete",
            iconProps: { iconName: "Delete" },
            onClick: () => {
                setLoading(true);
                handleFileDelete(context, table, id, col.name, setPropsValue)
                    .finally(() => setLoading(false));
            },
        });
    }

    const navigateToProps: IContextualMenuProps = { items };

    return (
        <div className={fileCellClassName}
            onMouseDown={(e) => { goToSettings(e) }} >
            {
                loading
                    ? (<Spinner size={SpinnerSize.small} />)
                    : (
                        <CommandButton
                            text={propsValue.fileName}
                            menuProps={navigateToProps}
                            checked={true}
                            onDoubleClick={(e) => e.preventDefault()}
                            styles={{ root: { width: "100%" } }}
                        />
                    )}
        </div>
    );

};

async function handleFileDownload(
    context: ComponentFramework.Context<IInputs>,
    fileUrl: string,
): Promise<string | null> {
    const page: any = (context as any).page;

    if (!fileUrl.includes("https://"))
        fileUrl = `${page.getClientUrl()}${fileUrl}`;

    try {
        const response = await fetch(fileUrl, {
            method: "GET",
            headers: {
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0",
                "Accept": "application/octet-stream"
            }
        });

        if (response.ok) {
            const blob = await response.blob();
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
                reader.onerror = () => reject("Failed to convert file to Base64.");
                reader.readAsDataURL(blob);
            });

            return base64;
        } else {
            const errorText = await response.text();
            throw new Error(errorText);
        }
    } catch (error) {
        console.error("Error downloading file:", error);
        return null;
    }
}

async function handleFileUpload(
    context: ComponentFramework.Context<IInputs>,
    settings: any,
    table: string,
    id: string,
    column: string,
    setPropsValue: React.Dispatch<React.SetStateAction<any | null>>
) {
    const page: any = (context as any).page;
    const collectionLogicalName = await context.utils.getEntityMetadata(table).then((metadata) => { return metadata._entitySetName });

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = settings.allowedTypes.map((type: any) => `.${type}`).join(",");

    fileInput.onchange = async (event: any) => {
        const file = event.target.files[0];
        if (file) {

            const file = event.target.files[0];
            if (file) {

                // Get allowed extensions
                const fileExtension = file.name.split('.').pop()?.toLowerCase();
                if (!settings.allowedTypes.includes(fileExtension)) {

                    // Warning invalid file type
                    context.navigation.openErrorDialog({ message: `Invalid file type.Allowed ${settings.allowedTypes.join(", ")}` });
                    return null;
                }

                const reader = new FileReader();
                reader.readAsArrayBuffer(file);
                reader.onloadend = async () => {
                    if (reader.result) {
                        const uploadResponse = await uploadFile(
                            page.getClientUrl(),
                            collectionLogicalName,
                            id,
                            column,
                            file,
                            reader.result
                        );

                        if (uploadResponse.success) {
                            setPropsValue(
                                {
                                    fileUrl: uploadResponse.url,
                                    fileName: file.name,
                                    fileSize: file.size,
                                    mimeType: file.type
                                });
                        } else {
                            console.error("Upload failed:", uploadResponse.message);
                        }
                    }
                };
            }
        };
    }
    fileInput.click();
}

async function handleFileDelete(
    context: ComponentFramework.Context<IInputs>,
    table: string,
    id: string,
    column: string,
    setPropsValue: React.Dispatch<React.SetStateAction<any | null>>
) {
    const page: any = (context as any).page;
    const collectionLogicalName = await context.utils.getEntityMetadata(table).then((metadata) => { return metadata._entitySetName });

    const deleteResponse = await deleteFile(
        page.getClientUrl(),
        collectionLogicalName,
        id,
        column
    );

    if (deleteResponse.success) {
        setPropsValue({
            fileUrl: "",
            fileName: "--",
            fileSize: 0,
            mimeType: ""
        });
    } else {
        console.error("Error deleting file:", deleteResponse.message);
    }
}

async function uploadFile(baseUrl: string, table: string, id: string, column: string, file: File, fileContent: string | ArrayBuffer): Promise<any> {
    const fileName = encodeURIComponent(file.name);
    const apiUrl = `${baseUrl}/api/data/v9.2/${table}(${id})/${column}?x-ms-file-name=${fileName}`;
    try {
        const response = await fetch(apiUrl, {
            method: "PATCH",
            headers: {
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0",
                "Content-Type": "application/octet-stream",
                Accept: "application/json",
            },
            body: fileContent,
        });

        if (response.status === 204) {
            const url = response.url.split("?")[0];
            return {
                success: true,
                message: "",
                url: `${url}/$value`
            };
        } else {
            const error = await response.text();
            return {
                success: false,
                message: error,
                url: ""
            };
        }
    } catch (error) {
        return {
            success: false,
            message: (error as any).message,
            url: ""
        };
    }
}

async function deleteFile(baseUrl: string, table: string, id: string, column: string): Promise<any> {
    const apiUrl = `${baseUrl}/api/data/v9.2/${table}(${id})/${column}`;
    try {
        const response = await fetch(apiUrl, {
            method: "DELETE",
            headers: {
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0",
                "Content-Type": "application/json; charset=utf-8",
                "Accept": "application/json"
            }
        });

        if (response.ok) {
            return {
                success: true,
                message: ""
            };
        } else {
            const error = await response.json();
            return {
                success: false,
                message: error.error.message || "Unknown error"
            };
        }
    } catch (error) {
        return {
            success: false,
            message: (error as any).message
        };
    }
}