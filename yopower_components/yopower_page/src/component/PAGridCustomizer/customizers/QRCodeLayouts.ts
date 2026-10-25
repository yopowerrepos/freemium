import { CodePart } from "./CodePartsTable";

const money = (amount: string, currency: string): string => {
    const value = parseFloat(amount);
    if (isNaN(value)) return amount;
    try {
        return value.toLocaleString(undefined, { style: "currency", currency: currency });
    } catch {
        return `${currency} ${amount}`;
    }
};

// IBAN mod 97: move country + check to the end, letters become 10..35, remainder must be 1
const ibanMeaning = (iban: string): string => {
    const clean = iban.replace(/\s/g, "").toUpperCase();
    const rearranged = (clean.slice(4) + clean.slice(0, 4)).replace(/[A-Z]/g, c => (c.charCodeAt(0) - 55).toString());
    let rest = 0;
    for (let i = 0; i < rearranged.length; i++) rest = (rest * 10 + parseInt(rearranged[i], 10)) % 97;
    return rest === 1 ? "valid" : "invalid";
};

const add = (parts: CodePart[], part: string, value: string | undefined, meaning?: string) => {
    if (value) parts.push({ part, value, meaning });
};

//#region PIX (BR Code, EMV merchant presented QR)
const readTlv = (payload: string): Record<string, string> | null => {
    const fields: Record<string, string> = {};
    let i = 0;
    while (i < payload.length) {
        const id = payload.slice(i, i + 2);
        const length = parseInt(payload.slice(i + 2, i + 4), 10);
        if (!/^\d{2}$/.test(id) || isNaN(length) || i + 4 + length > payload.length) return null;
        fields[id] = payload.slice(i + 4, i + 4 + length);
        i += 4 + length;
    }
    return fields;
};

// CRC16-CCITT (poly 0x1021, init 0xFFFF) over the payload up to and including "6304"
const crc16 = (text: string): string => {
    let crc = 0xFFFF;
    for (let i = 0; i < text.length; i++) {
        crc ^= text.charCodeAt(i) << 8;
        for (let bit = 0; bit < 8; bit++)
            crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
};

const parsePix = (value: string): CodePart[] | null => {
    const payload = value.trim();
    const root = readTlv(payload);
    if (!root || root["00"] !== "01") return null;

    // Merchant account info lives in 26..51, Pix uses the one with GUI br.gov.bcb.pix
    let account: Record<string, string> | null = null;
    for (let id = 26; id <= 51 && !account; id++) {
        const sub = root[id.toString()] ? readTlv(root[id.toString()]) : null;
        if (sub && sub["00"]?.toLowerCase() === "br.gov.bcb.pix") account = sub;
    }
    if (!account) return null;

    const additional = root["62"] ? readTlv(root["62"]) : null;
    const crcIndex = payload.lastIndexOf("6304");
    const parts: CodePart[] = [];

    add(parts, "Type", root["01"] === "12" ? "Dynamic" : "Static", root["01"] === "12" ? "Single use" : "Reusable");
    add(parts, "Pix key", account["01"]);
    add(parts, "Payload URL", account["25"], "Dynamic charge location");
    add(parts, "Description", account["02"]);
    add(parts, "Amount", root["54"], money(root["54"], "BRL"));
    add(parts, "Receiver", root["59"]);
    add(parts, "City", root["60"]);
    add(parts, "Postal code", root["61"]);
    add(parts, "Transaction ID", additional?.["05"]);
    add(parts, "CRC16", root["63"], crcIndex >= 0 && crc16(payload.slice(0, crcIndex + 4)) === root["63"]?.toUpperCase() ? "valid" : "invalid");

    return parts;
};
//#endregion

// EPC QR / GiroCode (SEPA credit transfer)
const parseEpc = (value: string): CodePart[] | null => {
    const lines = value.split(/\r?\n/);
    if (lines[0]?.trim() !== "BCD" || lines[3]?.trim() !== "SCT") return null;

    const amount = lines[7]?.trim() ?? "";
    const parts: CodePart[] = [];

    add(parts, "Version", lines[1]);
    add(parts, "BIC", lines[4]);
    add(parts, "Beneficiary", lines[5]);
    add(parts, "IBAN", lines[6], ibanMeaning(lines[6] ?? ""));
    add(parts, "Amount", amount, amount ? money(amount.replace(/^[A-Z]{3}/, ""), amount.slice(0, 3)) : undefined);
    add(parts, "Purpose", lines[8]);
    add(parts, "Reference", lines[9], "Structured creditor reference");
    add(parts, "Remittance", lines[10]);
    add(parts, "Information", lines[11]);

    return parts;
};

// Swiss QR-bill (Swiss Payments Code)
const parseSwissQr = (value: string): CodePart[] | null => {
    const lines = value.split(/\r?\n/);
    if (lines[0]?.trim() !== "SPC") return null;

    const address = (from: number) => lines.slice(from + 1, from + 6).filter(l => l?.trim()).join(", ");
    const referenceTypes: Record<string, string> = { QRR: "QR reference", SCOR: "Creditor reference (ISO 11649)", NON: "No reference" };
    const parts: CodePart[] = [];

    add(parts, "Version", lines[1]);
    add(parts, "IBAN", lines[3], ibanMeaning(lines[3] ?? ""));
    add(parts, "Creditor", lines[5], address(5));
    add(parts, "Amount", lines[18], lines[18] ? money(lines[18], lines[19] || "CHF") : undefined);
    add(parts, "Currency", lines[19]);
    add(parts, "Debtor", lines[21], address(21));
    add(parts, "Reference type", lines[27], referenceTypes[lines[27]?.trim()]);
    add(parts, "Reference", lines[28]);
    add(parts, "Message", lines[29]);
    add(parts, "Billing information", lines[31]);

    return parts;
};

export const parseQRCodeLayout = (layout: string | undefined, value: string): CodePart[] | null => {
    switch ((layout || "").toUpperCase()) {
        case "PIX": return parsePix(value);
        case "EPC": return parseEpc(value);
        case "SWISS_QR": return parseSwissQr(value);
        default: return null;
    }
};
