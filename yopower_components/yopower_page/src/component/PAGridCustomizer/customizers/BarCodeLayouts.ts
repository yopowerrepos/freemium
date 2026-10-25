import { Options } from "react-barcode";
import { CodePart } from "./CodePartsTable";

export interface BarCodeLayoutResult {
    code: string; // value to encode on the barcode
    format: Options["format"]; // default format for the layout (parameters.format wins)
    ean128?: boolean;
    parts: CodePart[];
}

const onlyDigits = (value: string) => value.replace(/\D/g, "");

// GS1 mod 10 (weights 3,1 from the right), used by GTIN, ITF-14, SSCC and ISBN-13
const gs1CheckDigit = (body: string): string => {
    let sum = 0;
    for (let i = 0; i < body.length; i++)
        sum += parseInt(body[body.length - 1 - i], 10) * (i % 2 === 0 ? 3 : 1);
    return ((10 - (sum % 10)) % 10).toString();
};

const checkMeaning = (expected: string, actual: string) => expected === actual ? "valid" : `invalid (expected ${expected})`;

//#region GS1 country prefixes (where the company registered, not where the product was made)
const gs1Prefixes: [number, number, string][] = [
    [0, 19, "USA / Canada"], [20, 29, "Restricted (in-store)"], [30, 39, "USA / Canada (drugs)"], [40, 49, "Restricted (in-store)"],
    [50, 59, "Coupons"], [60, 139, "USA / Canada"], [200, 299, "Restricted (in-store)"],
    [300, 379, "France"], [380, 380, "Bulgaria"], [383, 383, "Slovenia"], [385, 385, "Croatia"], [387, 387, "Bosnia and Herzegovina"],
    [389, 389, "Montenegro"], [400, 440, "Germany"], [450, 459, "Japan"], [460, 469, "Russia"], [470, 470, "Kyrgyzstan"],
    [471, 471, "Taiwan"], [474, 474, "Estonia"], [475, 475, "Latvia"], [476, 476, "Azerbaijan"], [477, 477, "Lithuania"],
    [478, 478, "Uzbekistan"], [479, 479, "Sri Lanka"], [480, 480, "Philippines"], [481, 481, "Belarus"], [482, 482, "Ukraine"],
    [484, 484, "Moldova"], [485, 485, "Armenia"], [486, 486, "Georgia"], [487, 487, "Kazakhstan"], [488, 488, "Tajikistan"],
    [489, 489, "Hong Kong"], [490, 499, "Japan"], [500, 509, "United Kingdom"], [520, 521, "Greece"], [528, 528, "Lebanon"],
    [529, 529, "Cyprus"], [530, 530, "Albania"], [531, 531, "North Macedonia"], [535, 535, "Malta"], [539, 539, "Ireland"],
    [540, 549, "Belgium / Luxembourg"], [560, 560, "Portugal"], [569, 569, "Iceland"], [570, 579, "Denmark"], [590, 590, "Poland"],
    [594, 594, "Romania"], [599, 599, "Hungary"], [600, 601, "South Africa"], [603, 603, "Ghana"], [604, 604, "Senegal"],
    [608, 608, "Bahrain"], [609, 609, "Mauritius"], [611, 611, "Morocco"], [613, 613, "Algeria"], [615, 615, "Nigeria"],
    [616, 616, "Kenya"], [618, 618, "Côte d'Ivoire"], [619, 619, "Tunisia"], [620, 620, "Tanzania"], [621, 621, "Syria"],
    [622, 622, "Egypt"], [623, 623, "Brunei"], [624, 624, "Libya"], [625, 625, "Jordan"], [626, 626, "Iran"], [627, 627, "Kuwait"],
    [628, 628, "Saudi Arabia"], [629, 629, "United Arab Emirates"], [640, 649, "Finland"], [690, 699, "China"], [700, 709, "Norway"],
    [729, 729, "Israel"], [730, 739, "Sweden"], [740, 740, "Guatemala"], [741, 741, "El Salvador"], [742, 742, "Honduras"],
    [743, 743, "Nicaragua"], [744, 744, "Costa Rica"], [745, 745, "Panama"], [746, 746, "Dominican Republic"], [750, 750, "Mexico"],
    [754, 755, "Canada"], [759, 759, "Venezuela"], [760, 769, "Switzerland"], [770, 771, "Colombia"], [773, 773, "Uruguay"],
    [775, 775, "Peru"], [777, 777, "Bolivia"], [778, 779, "Argentina"], [780, 780, "Chile"], [784, 784, "Paraguay"],
    [786, 786, "Ecuador"], [789, 790, "Brazil"], [800, 839, "Italy"], [840, 849, "Spain"], [850, 850, "Cuba"], [858, 858, "Slovakia"],
    [859, 859, "Czech Republic"], [860, 860, "Serbia"], [865, 865, "Mongolia"], [867, 867, "North Korea"], [868, 869, "Turkey"],
    [870, 879, "Netherlands"], [880, 880, "South Korea"], [884, 884, "Cambodia"], [885, 885, "Thailand"], [888, 888, "Singapore"],
    [890, 890, "India"], [893, 893, "Vietnam"], [896, 896, "Pakistan"], [899, 899, "Indonesia"], [900, 919, "Austria"],
    [930, 939, "Australia"], [940, 949, "New Zealand"], [950, 950, "GS1 Global Office"], [955, 955, "Malaysia"], [958, 958, "Macau"],
    [977, 977, "Serial publications (ISSN)"], [978, 979, "Books (ISBN)"], [980, 980, "Refund receipts"], [981, 984, "Coupons"], [990, 999, "Coupons"]
];
//#endregion

const gs1Country = (prefix: string): string => {
    const value = parseInt(prefix, 10);
    return gs1Prefixes.find(([from, to]) => value >= from && value <= to)?.[2] ?? "Unknown";
};

// Brazilian bank boleto (FEBRABAN), accepts the 44-digit barcode or the 47-digit linha digitável
const parseBrBoleto = (value: string): BarCodeLayoutResult | null => {
    const digits = onlyDigits(value);
    let code: string;

    if (digits.length === 44) code = digits;
    else if (digits.length === 47)
        code = digits.slice(0, 4) + digits.slice(32, 47) + digits.slice(4, 9) + digits.slice(10, 20) + digits.slice(21, 31);
    else return null;

    // Collection slips (arrecadação) start with 8, see BR_ARRECADACAO
    if (code[0] === "8") return null;

    const factor = code.slice(5, 9);
    const amount = parseInt(code.slice(9, 19), 10) / 100;

    return {
        code: code,
        format: "ITF",
        parts: [
            { part: "Bank", value: code.slice(0, 3), meaning: "Bank code" },
            { part: "Currency", value: code[3], meaning: code[3] === "9" ? "Real" : "Other" },
            { part: "Check digit", value: code[4], meaning: "mod 11 " + checkMeaning(boletoCheckDigit(code), code[4]) },
            { part: "Due-date factor", value: factor, meaning: boletoDueDate(factor) },
            { part: "Amount", value: code.slice(9, 19), meaning: amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) },
            { part: "Bank-specific field", value: code.slice(19, 44), meaning: "25 digits defined by the bank" }
        ]
    };
};

const boletoCheckDigit = (code: string): string => {
    const base = code.slice(0, 4) + code.slice(5);
    let sum = 0, weight = 2;
    for (let i = base.length - 1; i >= 0; i--) {
        sum += parseInt(base[i], 10) * weight;
        weight = weight === 9 ? 2 : weight + 1;
    }
    const dv = 11 - (sum % 11);
    return (dv === 0 || dv === 10 || dv === 11 ? 1 : dv).toString();
};

// Factor counts days from 07/10/1997 and restarted at 1000 on 22/02/2025, pick the cycle closest to today
const boletoDueDate = (factor: string): string => {
    const value = parseInt(factor, 10);
    if (value === 0) return "No due date";

    const day = 24 * 60 * 60 * 1000;
    const oldCycle = Date.UTC(1997, 9, 7) + value * day;
    const newCycle = Date.UTC(2025, 1, 22) + (value - 1000) * day;
    const now = Date.now();
    const date = value >= 1000 && Math.abs(newCycle - now) < Math.abs(oldCycle - now) ? newCycle : oldCycle;

    return new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
};

const arrecadacaoSegments: Record<string, string> = {
    "1": "City halls", "2": "Water and sanitation", "3": "Electricity and gas", "4": "Telecommunications",
    "5": "Government agencies", "6": "Companies (identified by CNPJ)", "7": "Traffic fines", "9": "Bank exclusive use"
};

// Brazilian collection slip (utilities, taxes, fees), accepts the 44-digit barcode or the 48-digit linha digitável
const parseBrArrecadacao = (value: string): BarCodeLayoutResult | null => {
    const digits = onlyDigits(value);
    let code: string;

    if (digits.length === 44) code = digits;
    else if (digits.length === 48)
        code = digits.slice(0, 11) + digits.slice(12, 23) + digits.slice(24, 35) + digits.slice(36, 47);
    else return null;

    if (code[0] !== "8") return null;

    const valueId = code[2];
    const isMod10 = valueId === "6" || valueId === "7";
    const base = code.slice(0, 3) + code.slice(4);
    const expected = isMod10 ? arrecadacaoMod10(base) : arrecadacaoMod11(base);
    const amount = parseInt(code.slice(4, 15), 10) / 100;
    const isCnpj = code[1] === "6";

    return {
        code: code,
        format: "ITF",
        parts: [
            { part: "Product", value: code[0], meaning: "Collection slip" },
            { part: "Segment", value: code[1], meaning: arrecadacaoSegments[code[1]] ?? "Unknown" },
            { part: "Value type", value: valueId, meaning: (valueId === "6" || valueId === "8" ? "Amount in reais" : "Reference value") + (isMod10 ? ", mod 10" : ", mod 11") },
            { part: "Check digit", value: code[3], meaning: (isMod10 ? "mod 10 " : "mod 11 ") + checkMeaning(expected, code[3]) },
            { part: "Amount", value: code.slice(4, 15), meaning: valueId === "6" || valueId === "8" ? amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : amount.toString() },
            isCnpj
                ? { part: "Company", value: code.slice(15, 23), meaning: "CNPJ root" }
                : { part: "Company", value: code.slice(15, 19), meaning: "Company / agency code" },
            { part: "Company-specific field", value: code.slice(isCnpj ? 23 : 19), meaning: `${isCnpj ? 21 : 25} digits defined by the company` }
        ]
    };
};

const arrecadacaoMod10 = (base: string): string => {
    let sum = 0, weight = 2;
    for (let i = base.length - 1; i >= 0; i--) {
        const product = parseInt(base[i], 10) * weight;
        sum += product > 9 ? product - 9 : product;
        weight = weight === 2 ? 1 : 2;
    }
    return ((10 - (sum % 10)) % 10).toString();
};

const arrecadacaoMod11 = (base: string): string => {
    let sum = 0, weight = 2;
    for (let i = base.length - 1; i >= 0; i--) {
        sum += parseInt(base[i], 10) * weight;
        weight = weight === 9 ? 2 : weight + 1;
    }
    const rest = sum % 11;
    return (rest === 0 || rest === 1 ? 0 : 11 - rest).toString();
};

// Retail product codes: EAN-13, UPC-A and EAN-8
const parseGtin = (value: string): BarCodeLayoutResult | null => {
    const code = onlyDigits(value);
    const check = code[code.length - 1];
    const expected = gs1CheckDigit(code.slice(0, -1));

    switch (code.length) {
        case 13: return {
            code: code,
            format: "EAN13",
            parts: [
                { part: "GS1 prefix", value: code.slice(0, 3), meaning: gs1Country(code.slice(0, 3)) },
                { part: "Company & item", value: code.slice(3, 12), meaning: "Assigned by the company" },
                { part: "Check digit", value: check, meaning: checkMeaning(expected, check) }
            ]
        };
        case 12: return {
            code: code,
            format: "UPC",
            parts: [
                { part: "GS1 prefix", value: code.slice(0, 2), meaning: gs1Country("0" + code.slice(0, 2)) },
                { part: "Company & item", value: code.slice(2, 11), meaning: "Assigned by the company" },
                { part: "Check digit", value: check, meaning: checkMeaning(expected, check) }
            ]
        };
        case 8: return {
            code: code,
            format: "EAN8",
            parts: [
                { part: "GS1 prefix", value: code.slice(0, 3), meaning: gs1Country(code.slice(0, 3)) },
                { part: "Item", value: code.slice(3, 7), meaning: "Assigned by GS1" },
                { part: "Check digit", value: check, meaning: checkMeaning(expected, check) }
            ]
        };
        case 14: return parseItf14(code);
        default: return null;
    }
};

// Shipping boxes and pallets (GTIN-14)
const parseItf14 = (value: string): BarCodeLayoutResult | null => {
    const code = onlyDigits(value);
    if (code.length !== 14) return null;

    const indicator = code[0];
    const check = code[13];

    return {
        code: code,
        format: "ITF14",
        parts: [
            { part: "Packaging indicator", value: indicator, meaning: indicator === "0" ? "Base unit" : indicator === "9" ? "Variable measure" : `Packaging level ${indicator}` },
            { part: "GS1 prefix", value: code.slice(1, 4), meaning: gs1Country(code.slice(1, 4)) },
            { part: "Company & item", value: code.slice(4, 13), meaning: "Assigned by the company" },
            { part: "Check digit", value: check, meaning: checkMeaning(gs1CheckDigit(code.slice(0, 13)), check) }
        ]
    };
};

// Books, accepts ISBN-13 or ISBN-10 (with or without hyphens)
const parseIsbn = (value: string): BarCodeLayoutResult | null => {
    const raw = value.replace(/[^0-9Xx]/g, "").toUpperCase();
    let code: string;

    if (raw.length === 13 && /^97[89]\d{10}$/.test(raw)) code = raw;
    else if (raw.length === 10 && /^\d{9}[\dX]$/.test(raw)) code = "978" + raw.slice(0, 9) + gs1CheckDigit("978" + raw.slice(0, 9));
    else return null;

    const check = code[12];
    const parts: CodePart[] = [
        { part: "Prefix", value: code.slice(0, 3), meaning: "Books (Bookland)" },
        { part: "Group, publisher & title", value: code.slice(3, 12), meaning: "Assigned by the ISBN agency and publisher" },
        { part: "Check digit", value: check, meaning: checkMeaning(gs1CheckDigit(code.slice(0, 12)), check) }
    ];

    if (code.startsWith("978"))
        parts.push({ part: "ISBN-10", value: code.slice(3, 12) + isbn10CheckDigit(code.slice(3, 12)), meaning: "Equivalent old format" });

    return { code: code, format: "EAN13", parts: parts };
};

const isbn10CheckDigit = (body: string): string => {
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(body[i], 10) * (10 - i);
    const dv = (11 - (sum % 11)) % 11;
    return dv === 10 ? "X" : dv.toString();
};

//#region GS1-128 application identifiers (most used only), length = fixed size, max = variable size
interface Gs1Ai { ai: string; name: string; length?: number; max?: number; kind?: "date" | "decimal" | "gtin" }
const gs1Ais: Gs1Ai[] = [
    { ai: "00", name: "SSCC (shipping container)", length: 18 },
    { ai: "01", name: "GTIN", length: 14, kind: "gtin" },
    { ai: "02", name: "GTIN of contained items", length: 14, kind: "gtin" },
    { ai: "10", name: "Batch / lot", max: 20 },
    { ai: "11", name: "Production date", length: 6, kind: "date" },
    { ai: "13", name: "Packaging date", length: 6, kind: "date" },
    { ai: "15", name: "Best before", length: 6, kind: "date" },
    { ai: "17", name: "Expiry date", length: 6, kind: "date" },
    { ai: "20", name: "Variant", length: 2 },
    { ai: "21", name: "Serial number", max: 20 },
    { ai: "30", name: "Count", max: 8 },
    { ai: "37", name: "Count of trade items", max: 8 },
    { ai: "400", name: "Purchase order", max: 30 },
    { ai: "410", name: "Ship to (GLN)", length: 13 },
    { ai: "422", name: "Country of origin", length: 3 },
    { ai: "310", name: "Net weight (kg)", length: 6, kind: "decimal" },
    { ai: "330", name: "Gross weight (kg)", length: 6, kind: "decimal" },
    { ai: "392", name: "Amount payable", max: 15, kind: "decimal" }
];
//#endregion

const FNC1 = "\xCF"; // jsbarcode FNC1, separates variable length fields
const GS = "\x1D";

const findAi = (text: string): { def: Gs1Ai, ai: string } | null => {
    // 310n / 330n / 392n carry the decimal places as 4th digit
    for (const def of gs1Ais) {
        const ai = def.kind === "decimal" ? text.slice(0, 4) : def.ai;
        if (text.startsWith(def.ai) && (def.kind !== "decimal" || /^\d{4}/.test(ai))) return { def, ai };
    }
    return null;
};

const gs1Meaning = (def: Gs1Ai, ai: string, data: string): string => {
    switch (def.kind) {
        case "date": {
            const [yy, mm, dd] = [data.slice(0, 2), data.slice(2, 4), data.slice(4, 6)];
            return dd === "00" ? `${mm}/20${yy} (end of month)` : new Date(Date.UTC(2000 + +yy, +mm - 1, +dd)).toLocaleDateString(undefined, { timeZone: "UTC" });
        }
        case "decimal": return (parseInt(data, 10) / Math.pow(10, +ai[3])).toString();
        case "gtin": return gs1Country(data.slice(1, 4)) + ", check " + checkMeaning(gs1CheckDigit(data.slice(0, 13)), data[13]);
        default: return "";
    }
};

// Logistics labels, accepts "(01)07891234567895(17)261231(10)LOT1" or raw digits with GS separators
const parseGs1128 = (value: string): BarCodeLayoutResult | null => {
    const fields: { def: Gs1Ai, ai: string, data: string }[] = [];

    if (value.includes("(")) {
        const regex = /\((\d{2,4})\)([^(]*)/g;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(value)) !== null) {
            const found = findAi(match[1]);
            if (!found) return null;
            fields.push({ def: found.def, ai: match[1], data: match[2].trim() });
        }
    } else {
        let rest = value.trim();
        while (rest.length > 0) {
            const found = findAi(rest);
            if (!found) return null;
            rest = rest.slice(found.ai.length);
            const end = found.def.length ?? (rest.includes(GS) ? rest.indexOf(GS) : rest.length);
            fields.push({ def: found.def, ai: found.ai, data: rest.slice(0, end) });
            rest = rest.slice(end);
            if (rest[0] === GS) rest = rest.slice(1);
        }
    }

    if (fields.length === 0) return null;

    return {
        code: fields.map((f, i) => f.ai + f.data + (f.def.length === undefined && i < fields.length - 1 ? FNC1 : "")).join(""),
        format: "CODE128",
        ean128: true,
        parts: fields.map(f => ({ part: `(${f.ai}) ${f.def.name}`, value: f.data, meaning: gs1Meaning(f.def, f.ai, f.data) }))
    };
};

export const parseBarCodeLayout = (layout: string | undefined, value: string): BarCodeLayoutResult | null => {
    switch ((layout || "").toUpperCase()) {
        case "BR_BOLETO": return parseBrBoleto(value);
        case "BR_ARRECADACAO": return parseBrArrecadacao(value);
        case "GTIN": return parseGtin(value);
        case "ITF14": return parseItf14(value);
        case "ISBN": return parseIsbn(value);
        case "GS1_128": return parseGs1128(value);
        default: return null;
    }
};
