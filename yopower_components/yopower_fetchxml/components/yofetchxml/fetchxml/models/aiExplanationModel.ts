/**
 * Shape of an AI Builder prompt result (msdyn_aimodel Predict, version 2.0), flattened from
 * responsev2.predictionOutput into what the "Explain" modal shows.
 */
export interface IAiTokenUsage {
    prompt: number;
    completion: number;
    total: number;
}

export interface IAiExplanation {
    predictionId?: string;
    operationStatus: string;
    text: string;
    finishReason?: string;
    modelName?: string;
    modelType?: string;
    thoughtSteps?: string;
    imagesCount: number;
    tokens: IAiTokenUsage;
    costAsAiBuilderCredits: number;
    costAsCopilotCredits: number;
}

interface IRawPredictionOutput {
    text?: string;
    Text?: string;
    finishReason?: string;
    FinishReason?: string;
    modelName?: string;
    modelType?: string;
    thoughtSteps?: string;
    imagesCount?: number;
    totalTokens?: number;
    promptTokens?: number;
    completionTokens?: number;
    costAsAiBuilderCredits?: number;
    costAsCopilotCredits?: number;
}

export interface IRawPredictResponse {
    response?: string | null;
    overrideHttpStatusCode?: string | null;
    overrideLocation?: string | null;
    overrideRetryAfter?: string | null;
    responsev2?: {
        operationStatus?: string;
        predictionId?: string;
        predictionOutput?: IRawPredictionOutput;
        error?: { message?: string };
    } | null;
}

const toNumber = (value: unknown): number => (typeof value === "number" ? value : Number(value) || 0);

/** Maps the raw Predict response to an IAiExplanation, throwing when the prediction didn't succeed. */
export function parsePredictResponse(raw: IRawPredictResponse): IAiExplanation {
    const v2 = raw.responsev2;
    if (!v2) {
        throw new Error("The AI model returned no responsev2 payload.");
    }
    const status = v2.operationStatus ?? "Unknown";
    if (status !== "Success") {
        throw new Error(v2.error?.message ?? `The AI prediction did not succeed (status: ${status}).`);
    }

    const out = v2.predictionOutput ?? {};
    const prompt = toNumber(out.promptTokens);
    const completion = toNumber(out.completionTokens);

    return {
        predictionId: v2.predictionId,
        operationStatus: status,
        text: out.text ?? out.Text ?? "",
        finishReason: out.finishReason ?? out.FinishReason,
        modelName: out.modelName,
        modelType: out.modelType,
        thoughtSteps: out.thoughtSteps === "" ? undefined : out.thoughtSteps,
        imagesCount: toNumber(out.imagesCount),
        tokens: {
            prompt,
            completion,
            total: out.totalTokens !== undefined ? toNumber(out.totalTokens) : prompt + completion,
        },
        costAsAiBuilderCredits: toNumber(out.costAsAiBuilderCredits),
        costAsCopilotCredits: toNumber(out.costAsCopilotCredits),
    };
}

/** What the "explaining" column stores: the explanation plus the query it describes, so a later edit can be flagged as stale. */
export interface ISavedExplanation extends IAiExplanation {
    fetchXml: string;
    generatedAt: string;
}

export function serializeSavedExplanation(saved: ISavedExplanation): string {
    return JSON.stringify(saved, null, 2);
}

/**
 * Reads the "explaining" column. Anything that isn't the JSON written by serializeSavedExplanation
 * (e.g. text typed straight into the column) is kept as a plain explanation with no query or usage info.
 */
export function parseSavedExplanation(raw: string | null | undefined): ISavedExplanation | undefined {
    if (!raw?.trim()) return undefined;
    try {
        const parsed = JSON.parse(raw) as Partial<ISavedExplanation>;
        if (typeof parsed.text === "string") {
            return {
                operationStatus: parsed.operationStatus ?? "Success",
                text: parsed.text,
                predictionId: parsed.predictionId,
                finishReason: parsed.finishReason,
                modelName: parsed.modelName,
                modelType: parsed.modelType,
                thoughtSteps: parsed.thoughtSteps,
                imagesCount: toNumber(parsed.imagesCount),
                tokens: {
                    prompt: toNumber(parsed.tokens?.prompt),
                    completion: toNumber(parsed.tokens?.completion),
                    total: toNumber(parsed.tokens?.total),
                },
                costAsAiBuilderCredits: toNumber(parsed.costAsAiBuilderCredits),
                costAsCopilotCredits: toNumber(parsed.costAsCopilotCredits),
                fetchXml: parsed.fetchXml ?? "",
                generatedAt: parsed.generatedAt ?? "",
            };
        }
    } catch {
        // Not our JSON - fall through to plain text.
    }
    return {
        operationStatus: "Success",
        text: raw,
        imagesCount: 0,
        tokens: { prompt: 0, completion: 0, total: 0 },
        costAsAiBuilderCredits: 0,
        costAsCopilotCredits: 0,
        fetchXml: "",
        generatedAt: "",
    };
}

/**
 * Dataverse wraps AI Builder failures as a JSON string inside error.message
 * ({"operationStatus":"Error","error":{"message":"..."}}); surfaces the inner message when present.
 */
export function extractAiErrorMessage(message: string | undefined): string {
    if (!message) return "The AI explanation request failed.";
    try {
        const parsed = JSON.parse(message) as { error?: { message?: string } };
        return parsed.error?.message ?? message;
    } catch {
        return message;
    }
}
