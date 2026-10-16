import { IAiExplanation, IRawPredictResponse, extractAiErrorMessage, parsePredictResponse } from "../models/aiExplanationModel";

/** The AI Builder prompt that explains a FetchXML query in plain language (input variable "FetchXML Query"). */
export const DEFAULT_AI_MODEL_ID = "7e91d0c8-fa55-4309-8653-153050b91dd2";

const WEB_API_VERSION_PATH = "/api/data/v9.2";

// Identifies the caller to AI Builder; Predict rejects requests without it ("Source is null").
const PREDICT_SOURCE = JSON.stringify({
    consumptionSource: "PowerApps",
    partnerSource: "AIBuilder",
    consumptionSourceVersion: "PCF",
});

interface IXrmWebApiExecuteGlobal {
    Xrm?: {
        WebApi?: {
            execute?: (request: unknown) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;
        };
    };
}

function buildRequestV2(fetchXml: string): Record<string, unknown> {
    return {
        "@odata.type": "#Microsoft.Dynamics.CRM.expando",
        // "FetchXML Query" - AI Builder encodes the space in prompt input names as _20.
        FetchXML_20Query: fetchXml,
    };
}

/**
 * Asks the AI Builder prompt to explain a FetchXML query, via the msdyn_aimodel-bound Predict
 * action. Goes through Xrm.WebApi.execute when the host exposes it - PCF's context.webAPI can't
 * call actions - and falls back to a direct Web API POST (e.g. the test harness).
 */
export async function explainFetchXml(fetchXml: string, aiModelId: string = DEFAULT_AI_MODEL_ID): Promise<IAiExplanation> {
    const xrm = (window as unknown as IXrmWebApiExecuteGlobal).Xrm;
    let raw: IRawPredictResponse;

    try {
        if (xrm?.WebApi?.execute) {
            const request = {
                entity: { entityType: "msdyn_aimodel", id: aiModelId },
                version: "2.0",
                requestv2: buildRequestV2(fetchXml),
                source: PREDICT_SOURCE,
                getMetadata: () => ({
                    boundParameter: "entity",
                    parameterTypes: {
                        entity: { typeName: "mscrm.msdyn_aimodel", structuralProperty: 5 },
                        version: { typeName: "Edm.String", structuralProperty: 1 },
                        requestv2: { typeName: "mscrm.expando", structuralProperty: 5 },
                        source: { typeName: "Edm.String", structuralProperty: 1 },
                    },
                    operationType: 0,
                    operationName: "Predict",
                }),
            };
            const response = await xrm.WebApi.execute(request);
            if (!response.ok) throw new Error("Predict request failed");
            raw = (await response.json()) as IRawPredictResponse;
        } else {
            const response = await fetch(`${WEB_API_VERSION_PATH}/msdyn_aimodels(${aiModelId})/Microsoft.Dynamics.CRM.Predict`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json; charset=utf-8",
                    "OData-MaxVersion": "4.0",
                    "OData-Version": "4.0",
                },
                credentials: "same-origin",
                body: JSON.stringify({ version: "2.0", requestv2: buildRequestV2(fetchXml), source: PREDICT_SOURCE }),
            });
            if (!response.ok) {
                const body = (await response.json().catch(() => undefined)) as { error?: { message?: string } } | undefined;
                throw new Error(body?.error?.message ?? `Predict request failed (${response.status})`);
            }
            raw = (await response.json()) as IRawPredictResponse;
        }
    } catch (e) {
        throw new Error(extractAiErrorMessage((e as Error)?.message));
    }

    return parsePredictResponse(raw);
}
