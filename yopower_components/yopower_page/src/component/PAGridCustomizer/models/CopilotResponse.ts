export interface CopilotResponse {
    type: string;
    textFormat: string;
    replyToId: string;
    attachments: Array<any>;
    text: string;
}