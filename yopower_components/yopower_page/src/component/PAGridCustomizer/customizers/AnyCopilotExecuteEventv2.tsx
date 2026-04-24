import * as React from "react";
import { ICell } from "../interfaces/ICell";
import { v4 as uuidv4 } from "uuid";
import { Icon, Text } from "@fluentui/react";
import { IContextualMenuItem, PrimaryButton, DefaultButton } from "@fluentui/react";
import { CopilotResponse } from "../models/common/CopilotResponse";
import { _903AnyCopilotExecuteEvent } from "../models/customizers/_903AnyCopilotExecuteEvent";
import { Button, Spinner, FluentProvider, IdPrefixProvider, webLightTheme, PopoverTrigger, PopoverSurface, Popover, Input } from "@fluentui/react-components";

interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
    isConsentCard?: boolean;
    isError?: boolean;
    isAdaptiveCard?: boolean;
    textFormat?: "plain" | "markdown" | "xml";
    adaptiveCardContent?: any;
    consentData?: {
        replyToId: string;
        message: string;
    };
    rawResponse?: CopilotResponse;
}

/**
 * Simple markdown to HTML converter
 */
function markdownToHtml(markdown: string): string {
    if (!markdown) return "";
    
    // First, handle tables before other processing
    const lines = markdown.split('\n');
    const processedLines: string[] = [];
    let inTable = false;
    let tableRows: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if this is a table row (starts and ends with |)
        if (line.startsWith('|') && line.endsWith('|')) {
            // Check if it's a separator row (contains only |, -, :, spaces)
            if (/^[\|\-:\s]+$/.test(line)) {
                // Skip separator row but mark we're in a table
                inTable = true;
                continue;
            }
            
            if (!inTable && tableRows.length === 0) {
                // This might be the header row
                tableRows.push(line);
            } else {
                inTable = true;
                tableRows.push(line);
            }
        } else {
            // Not a table row - flush any accumulated table rows
            if (tableRows.length > 0) {
                processedLines.push(convertTableToHtml(tableRows));
                tableRows = [];
                inTable = false;
            }
            processedLines.push(line);
        }
    }
    
    // Flush remaining table rows
    if (tableRows.length > 0) {
        processedLines.push(convertTableToHtml(tableRows));
    }
    
    let html = processedLines.join('\n')
        // Escape HTML (but not our table tags)
        .replace(/&(?!nbsp;|lt;|gt;|amp;)/g, "&amp;")
        // Headers
        .replace(/^### (.+)$/gm, "<h3 style='margin:8px 0 4px 0;font-size:14px;'>$1</h3>")
        .replace(/^## (.+)$/gm, "<h2 style='margin:8px 0 4px 0;font-size:15px;'>$1</h2>")
        .replace(/^# (.+)$/gm, "<h1 style='margin:8px 0 4px 0;font-size:16px;'>$1</h1>")
        // Bold
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/__(.+?)__/g, "<strong>$1</strong>")
        // Italic
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/_(.+?)_/g, "<em>$1</em>")
        // Code blocks
        .replace(/```([\s\S]*?)```/g, "<pre style='background:#f4f4f4;padding:8px;border-radius:4px;overflow-x:auto;font-size:11px;'><code>$1</code></pre>")
        // Inline code
        .replace(/`(.+?)`/g, "<code style='background:#f4f4f4;padding:2px 4px;border-radius:2px;font-size:11px;'>$1</code>")
        // Links
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" style="color:#5B5FC7;">$1</a>')
        // Unordered lists
        .replace(/^\* (.+)$/gm, "<li>$1</li>")
        .replace(/^- (.+)$/gm, "<li>$1</li>")
        // Ordered lists
        .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
        // Line breaks (but not after block elements)
        .replace(/\n(?!<)/g, "<br/>");
    
    // Wrap consecutive li elements in ul
    html = html.replace(/(<li>.*?<\/li>(<br\/>)?)+/g, (match) => {
        const cleanMatch = match.replace(/<br\/>/g, '');
        return "<ul style='margin:8px 0;padding-left:20px;'>" + cleanMatch + "</ul>";
    });
    
    return html;
}

/**
 * Convert markdown table rows to HTML table
 */
function convertTableToHtml(rows: string[]): string {
    if (rows.length === 0) return "";
    
    let html = "<table style='border-collapse:collapse;width:100%;margin:8px 0;font-size:12px;'>";
    
    rows.forEach((row, index) => {
        const cells = row.split('|').filter(cell => cell.trim() !== '');
        const isHeader = index === 0;
        const tag = isHeader ? 'th' : 'td';
        const headerStyle = isHeader ? 'font-weight:600;background:#f5f5f5;' : '';
        
        html += "<tr>";
        cells.forEach(cell => {
            html += `<${tag} style='border:1px solid #ddd;padding:6px 8px;text-align:left;${headerStyle}'>${cell.trim()}</${tag}>`;
        });
        html += "</tr>";
    });
    
    html += "</table>";
    return html;
}

/**
 * Check if response has an adaptive card (non-consent)
 */
function hasAdaptiveCard(response: CopilotResponse): boolean {
    return response.attachments?.some(a =>
        a.contentType === "application/vnd.microsoft.card.adaptive"
    ) && !isConsentCard(response);
}

/**
 * Get adaptive card content from response
 */
function getAdaptiveCardContent(response: CopilotResponse): any {
    const attachment = response.attachments?.find(a =>
        a.contentType === "application/vnd.microsoft.card.adaptive"
    );
    return attachment?.content || null;
}

/**
 * Check if the response is a consent card requiring user permission
 */
function isConsentCard(response: CopilotResponse): boolean {
    return response.name === "aiPrompt/consentCard" &&
        response.attachments?.some(a =>
            a.contentType === "application/vnd.microsoft.card.adaptive"
        );
}

/**
 * Check if the response is an error event
 */
function isErrorEvent(response: CopilotResponse): boolean {
    return response.type === "event" && response.name === "MS.PA.PVAError";
}

/**
 * Check if the response is an empty message that should be skipped
 */
function isEmptyMessage(response: CopilotResponse): boolean {
    return response.type === "message" && 
        (!response.text || response.text.trim() === "") && 
        (!response.attachments || response.attachments.length === 0);
}

/**
 * Extract error details from a PVA error event
 */
function getErrorDetails(response: CopilotResponse): { message: string; code: string } {
    try {
        const value = typeof response.value === "string" 
            ? JSON.parse(response.value) 
            : response.value;
        return {
            message: value?.ErrorMessage || "An unknown error occurred",
            code: value?.ErrorCode || "UnknownError"
        };
    } catch {
        return {
            message: "Failed to parse error details",
            code: "ParseError"
        };
    }
}

/**
 * Extract the consent card message from the attachments
 */
function getConsentMessage(response: CopilotResponse): string {
    const attachment = response.attachments?.find(a =>
        a.contentType === "application/vnd.microsoft.card.adaptive"
    );
    if (attachment?.content?.body) {
        const textBlocks = attachment.content.body.filter((b: any) => b.type === "TextBlock");
        return textBlocks.map((b: any) => b.text).join("\n");
    }
    return "Agent needs your permission to continue.";
}

/**
 * Extract text content from Copilot response
 */
function getResponseContent(response: CopilotResponse): string {
    if (response.text) {
        return response.text;
    }
    if (response.attachments && response.attachments.length > 0) {
        const attachment = response.attachments[0];
        if (attachment.content?.body) {
            const textBlocks = attachment.content.body.filter((b: any) => b.type === "TextBlock");
            return textBlocks.map((b: any) => b.text).join("\n");
        }
    }
    return "Response received";
}

/**
 * Adaptive Card Renderer Component
 * Renders a simplified version of Adaptive Cards
 */
const AdaptiveCardRenderer: React.FC<{ card: any }> = ({ card }) => {
    const renderElement = (element: any, index: number): React.ReactNode => {
        if (!element) return null;
        
        switch (element.type) {
            case "TextBlock":
                const textStyle: React.CSSProperties = {
                    fontSize: element.size === "large" ? 16 : element.size === "medium" ? 14 : 12,
                    fontWeight: element.weight === "bolder" ? 600 : 400,
                    color: element.color === "accent" ? "#5B5FC7" : element.color === "attention" ? "#D32F2F" : "#333",
                    marginBottom: element.spacing === "none" ? 0 : 8,
                    whiteSpace: element.wrap ? "pre-wrap" : "nowrap"
                };
                return <div key={index} style={textStyle}>{element.text}</div>;
            
            case "Image":
                return (
                    <img 
                        key={index}
                        src={element.url} 
                        alt={element.altText || ""} 
                        style={{ 
                            maxWidth: "100%", 
                            height: element.height || "auto",
                            borderRadius: 4,
                            marginBottom: 8
                        }} 
                    />
                );
            
            case "Container":
                return (
                    <div key={index} style={{ marginBottom: 8 }}>
                        {element.items?.map((item: any, i: number) => renderElement(item, i))}
                    </div>
                );
            
            case "ColumnSet":
                return (
                    <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        {element.columns?.map((col: any, i: number) => (
                            <div key={i} style={{ flex: col.width === "auto" ? "0 0 auto" : 1 }}>
                                {col.items?.map((item: any, j: number) => renderElement(item, j))}
                            </div>
                        ))}
                    </div>
                );
            
            case "Column":
                return (
                    <div key={index} style={{ flex: element.width === "auto" ? "0 0 auto" : 1 }}>
                        {element.items?.map((item: any, i: number) => renderElement(item, i))}
                    </div>
                );
            
            case "FactSet":
                return (
                    <div key={index} style={{ marginBottom: 8 }}>
                        {element.facts?.map((fact: any, i: number) => (
                            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                                <span style={{ fontWeight: 600, minWidth: 100 }}>{fact.title}:</span>
                                <span>{fact.value}</span>
                            </div>
                        ))}
                    </div>
                );
            
            case "ActionSet":
                return (
                    <div key={index} style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        {element.actions?.map((action: any, i: number) => (
                            <Button
                                key={i}
                                size="small"
                                appearance={action.style === "positive" ? "primary" : "outline"}
                                onClick={() => {
                                    if (action.type === "Action.OpenUrl" && action.url) {
                                        window.open(action.url, "_blank");
                                    }
                                }}
                            >
                                {action.title}
                            </Button>
                        ))}
                    </div>
                );
            
            case "RichTextBlock":
                return (
                    <div key={index} style={{ marginBottom: 8 }}>
                        {element.inlines?.map((inline: any, i: number) => {
                            if (typeof inline === "string") return inline;
                            if (inline.type === "TextRun") {
                                return (
                                    <span 
                                        key={i} 
                                        style={{ 
                                            fontWeight: inline.weight === "bolder" ? 600 : 400,
                                            fontStyle: inline.italic ? "italic" : "normal"
                                        }}
                                    >
                                        {inline.text}
                                    </span>
                                );
                            }
                            return null;
                        })}
                    </div>
                );
                
            default:
                return null;
        }
    };

    if (!card || !card.body) return null;

    return (
        <div style={{ fontSize: 12 }}>
            {card.body.map((element: any, index: number) => renderElement(element, index))}
            {card.actions && (
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    {card.actions.map((action: any, i: number) => (
                        <Button
                            key={i}
                            size="small"
                            appearance={action.style === "positive" ? "primary" : "outline"}
                            onClick={() => {
                                if (action.type === "Action.OpenUrl" && action.url) {
                                    window.open(action.url, "_blank");
                                }
                            }}
                        >
                            {action.title}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const AnyCopilotExecuteEventv2: React.FC<ICell> = (cell) => {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [sending, setSending] = React.useState<boolean>(false);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
    const [messages, setMessages] = React.useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = React.useState<string>("");
    const [currentEventName, setCurrentEventName] = React.useState<string>("");
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    
    const params = JSON.parse(cell.definition.parameters) as _903AnyCopilotExecuteEvent;
    const events = params.events;
    let items = new Array<IContextualMenuItem>();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const addMessage = (role: "user" | "assistant" | "system", content: string, options?: Partial<ChatMessage>) => {
        const newMsg: ChatMessage = {
            id: uuidv4(),
            role,
            content,
            timestamp: new Date(),
            ...options
        };
        setMessages(prev => [...prev, newMsg]);
        return newMsg;
    };

    const handleConsentResponse = async (messageId: string, action: "Allow" | "Cancel") => {
        const consentMessage = messages.find(m => m.id === messageId);
        if (!consentMessage?.consentData) return;

        // Update the consent card message to show the user's choice
        setMessages(prev => prev.map(m => 
            m.id === messageId 
                ? { ...m, content: `${m.content}\n\n✅ You chose: ${action}`, isConsentCard: false }
                : m
        ));

        if (action === "Cancel") {
            addMessage("system", "Operation cancelled by user.");
            setSending(false);
            return;
        }

        setSending(true);
        try {
            const actionData = {
                action: "Allow",
                id: "submit",
                shouldAwaitUserInput: true
            };
            
            const response = await (cell.context as any).copilot.executePrompt(
                { 
                    replyToId: consentMessage.consentData.replyToId,
                    actionData: actionData
                }
            );
            
            await processResponse(response);
        } catch (error: any) {
            addMessage("system", `Error: ${error.message}`);
        } finally {
            setSending(false);
        }
    };

    const processResponse = async (response: Array<CopilotResponse>) => {
        if (response && response.length > 0) {
            for (const resp of response) {
                // Skip empty messages
                if (isEmptyMessage(resp)) {
                    continue;
                }
                
                // Handle error events
                if (isErrorEvent(resp)) {
                    const errorDetails = getErrorDetails(resp);
                    addMessage("system", `Error (${errorDetails.code}):\n${errorDetails.message}`, {
                        rawResponse: resp,
                        isError: true
                    });
                    continue;
                }
                
                if (isConsentCard(resp)) {
                    // Add consent card as a special message
                    addMessage("assistant", getConsentMessage(resp), {
                        isConsentCard: true,
                        consentData: {
                            replyToId: resp.replyToId,
                            message: getConsentMessage(resp)
                        },
                        rawResponse: resp
                    });
                } else if (hasAdaptiveCard(resp)) {
                    // Add adaptive card message
                    addMessage("assistant", "", {
                        isAdaptiveCard: true,
                        adaptiveCardContent: getAdaptiveCardContent(resp),
                        rawResponse: resp
                    });
                } else {
                    // Add regular response (text or markdown)
                    // Default to markdown since most Copilot responses use markdown
                    const format = resp.textFormat || "markdown";
                    addMessage("assistant", getResponseContent(resp), {
                        textFormat: format as "plain" | "markdown" | "xml",
                        rawResponse: resp
                    });
                }
            }
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || sending) return;
        
        const userInput = newMessage.trim();
        setNewMessage("");
        addMessage("user", userInput);
        setSending(true);

        try {
            // Use executePrompt to send user message
            const response = await (window as any).Xrm.Copilot.executePrompt(userInput);
            await processResponse(response);
        } catch (error: any) {
            addMessage("system", `Error: ${error.message}`);
        } finally {
            setSending(false);
        }
    };

    const handleEventClick = async (eventName: string) => {
        setCurrentEventName(eventName);
        setLoading(true);
        setSending(true);

        try {
            const response = await (cell.context as any).copilot.executeEvent(
                eventName, 
                { table: cell.table, id: cell.id, from: cell.subgrid }
            );
            await processResponse(response);
        } catch (error: any) {
            addMessage("system", `Error: ${error.message}`);
        } finally {
            setLoading(false);
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClearChat = () => {
        setMessages([]);
    };

    if (events && events.length > 0) {
        items = items.concat(events.map(m => {
            return {
                key: m.label,
                text: m.label,
                title: m.tooltip,
                onClick: () => { handleEventClick(m.event); }
            } as IContextualMenuItem;
        }));
    }

    const onlyOne = items.length === 1;
    const item = onlyOne ? items[0] : null;
    const hasMessages = messages.length > 0;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <IdPrefixProvider value={`copilot-chat-${cell.table}-${cell.id}`}>
                <FluentProvider theme={webLightTheme}>
                    <Popover withArrow onOpenChange={(e, data) => setIsPopoverOpen(data.open)}>
                        <PopoverTrigger disableButtonEnhancement>
                            <Button
                                size="small"
                                appearance="subtle"
                                icon={loading ? <Spinner size="tiny" /> : <Icon imageProps={{ src: "/WebResources/msdyn_CopilotIconWithColor.svg", style: { height: 18 } }} />}
                                style={{
                                    minWidth: "auto",
                                    padding: "4px 8px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    color: hasMessages ? "#572EFF" : "#333",
                                    background: hasMessages ? "#F0EFFF" : "transparent"
                                }}
                            >
                                {onlyOne ? item?.text : cell.props.formattedValue}
                            </Button>
                        </PopoverTrigger>
                        <PopoverSurface tabIndex={-1} style={{ width: "70vw", maxWidth: 900, height: 500, display: "flex", flexDirection: "column", padding: 0 }}>
                            {/* Header */}
                            <div style={{ 
                                padding: "12px 16px", 
                                borderBottom: "1px solid #eee", 
                                display: "flex", 
                                justifyContent: "space-between", 
                                alignItems: "center",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <Icon imageProps={{ src: "/WebResources/msdyn_CopilotIconWithColor.svg", style: { height: 24, filter: "brightness(0) invert(1)" } }} />
                                    <Text variant="large" style={{ fontWeight: 600, color: "#fff" }}>
                                        Copilot Agent
                                    </Text>
                                </div>
                                <Button
                                    size="small"
                                    appearance="subtle"
                                    icon={<Icon iconName="Delete" style={{ color: "#fff" }} />}
                                    onClick={handleClearChat}
                                    title="Clear chat"
                                    style={{ minWidth: "auto" }}
                                />
                            </div>

                            {/* Event buttons */}
                            {events && events.length > 0 && (
                                <div style={{ 
                                    padding: "8px 12px", 
                                    borderBottom: "1px solid #eee", 
                                    display: "flex", 
                                    flexWrap: "wrap",
                                    gap: 8 
                                }}>
                                    {events.map((event, idx) => (
                                        <Button
                                            key={idx}
                                            size="small"
                                            appearance="outline"
                                            onClick={() => handleEventClick(event.event)}
                                            disabled={sending}
                                            style={{ fontSize: 12 }}
                                        >
                                            {event.label}
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {/* Messages area */}
                            <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 12 }}>
                                {messages.length === 0 ? (
                                    <div style={{ 
                                        flex: 1, 
                                        display: "flex", 
                                        flexDirection: "column",
                                        alignItems: "center", 
                                        justifyContent: "center",
                                        color: "#666"
                                    }}>
                                        <Icon imageProps={{ src: "/WebResources/msdyn_CopilotIconWithColor.svg", style: { height: 48, opacity: 0.5 } }} />
                                        <Text variant="medium" style={{ marginTop: 12, color: "#666" }}>
                                            Start a conversation with Copilot
                                        </Text>
                                        <Text variant="small" style={{ color: "#999", marginTop: 4 }}>
                                            Click an event button or type a message
                                        </Text>
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.id}
                                            style={{
                                                display: "flex",
                                                justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                                                marginBottom: 4
                                            }}
                                        >
                                            <div style={{ maxWidth: "85%" }}>
                                                <div style={{
                                                    backgroundColor: message.role === "user" 
                                                        ? "#5B5FC7" 
                                                        : message.isError
                                                            ? "#FDEDED"
                                                            : message.role === "system" 
                                                                ? "#FFF3CD" 
                                                                : message.isConsentCard 
                                                                    ? "#FFF8E1" 
                                                                    : "#F5F5F5",
                                                    color: message.role === "user" ? "#fff" : "#333",
                                                    borderRadius: message.role === "user" 
                                                        ? "16px 16px 4px 16px" 
                                                        : "16px 16px 16px 4px",
                                                    padding: "10px 14px",
                                                    border: message.isError 
                                                        ? "1px solid #F5C6CB" 
                                                        : message.isConsentCard 
                                                            ? "1px solid #FFE082" 
                                                            : "none"
                                                }}>
                                                    {message.role === "assistant" && !message.isConsentCard && (
                                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                                            <Icon imageProps={{ src: "/WebResources/msdyn_CopilotIconWithColor.svg", style: { height: 14 } }} />
                                                            <Text variant="small" style={{ fontWeight: 600, color: "#5B5FC7" }}>
                                                                Copilot
                                                            </Text>
                                                        </div>
                                                    )}
                                                    {message.isError && (
                                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                                                            <Icon iconName="ErrorBadge" style={{ color: "#D32F2F", fontSize: 16 }} />
                                                            <Text variant="small" style={{ fontWeight: 600, color: "#D32F2F" }}>
                                                                Error
                                                            </Text>
                                                        </div>
                                                    )}
                                                    {message.isConsentCard && (
                                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                                                            <Icon iconName="Shield" style={{ color: "#B8860B", fontSize: 16 }} />
                                                            <Text variant="small" style={{ fontWeight: 600, color: "#B8860B" }}>
                                                                Permission Required
                                                            </Text>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Render message content based on type */}
                                                    {message.isAdaptiveCard && message.adaptiveCardContent ? (
                                                        <AdaptiveCardRenderer card={message.adaptiveCardContent} />
                                                    ) : message.textFormat === "markdown" ? (
                                                        <div 
                                                            style={{ fontSize: 12 }}
                                                            dangerouslySetInnerHTML={{ __html: markdownToHtml(message.content) }} 
                                                        />
                                                    ) : (
                                                        <Text variant="small" style={{ 
                                                            whiteSpace: "pre-wrap",
                                                            display: "block"
                                                        }}>
                                                            {message.content}
                                                        </Text>
                                                    )}
                                                    
                                                    {/* Consent buttons */}
                                                    {message.isConsentCard && (
                                                        <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                                            <PrimaryButton 
                                                                text="Allow" 
                                                                onClick={() => handleConsentResponse(message.id, "Allow")}
                                                                disabled={sending}
                                                                styles={{ root: { minWidth: 80 } }}
                                                            />
                                                            <DefaultButton 
                                                                text="Cancel" 
                                                                onClick={() => handleConsentResponse(message.id, "Cancel")}
                                                                disabled={sending}
                                                                styles={{ root: { minWidth: 80 } }}
                                                            />
                                                        </div>
                                                    )}
                                                    
                                                    <Text variant="tiny" style={{ 
                                                        color: message.role === "user" ? "rgba(255,255,255,0.7)" : "#999", 
                                                        display: "block", 
                                                        textAlign: "right",
                                                        marginTop: 4
                                                    }}>
                                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Text>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                
                                {/* Loading indicator */}
                                {sending && (
                                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                        <div style={{
                                            backgroundColor: "#F5F5F5",
                                            borderRadius: "16px 16px 16px 4px",
                                            padding: "12px 16px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8
                                        }}>
                                            <Spinner size="tiny" />
                                            <Text variant="small" style={{ color: "#666" }}>
                                                Copilot is thinking...
                                            </Text>
                                        </div>
                                    </div>
                                )}
                                
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input area */}
                            {/* <div style={{ 
                                padding: "12px 16px", 
                                borderTop: "1px solid #eee",
                                display: "flex",
                                gap: 8,
                                alignItems: "center"
                            }}>
                                <Input
                                    ref={inputRef}
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e, data) => setNewMessage(data.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={sending}
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    appearance="primary"
                                    icon={<Icon iconName="Send" style={{ fontSize: 14 }} />}
                                    onClick={handleSendMessage}
                                    disabled={sending || !newMessage.trim()}
                                    style={{ minWidth: "auto", padding: "8px 12px" }}
                                />
                            </div> */}
                        </PopoverSurface>
                    </Popover>
                </FluentProvider>
            </IdPrefixProvider>
        </div>
    );
};
