# Text (Bar Code)

- ✅ Single Line of Text and Multiple Lines of Text (Memo)
- ⚠️ Parameters are optional, an empty json `{}` renders the text as a `CODE128` barcode
- Shows the value on the cell (monospace, truncated with ellipsis) and a **Copy** button that sends the raw value to the clipboard.
- Click the value to open a popover with the barcode (SVG, scaled to fit the popover).
- When a `layout` is informed and the value matches it, the popover also shows a breakdown table with each part of the code, its meaning and check digit validation.
- Values that cannot be encoded in the chosen format display **Invalid {format} barcode** instead of breaking the grid.
- Empty cells render nothing.

## Parameters

```json
{
  "layout": "BR_BOLETO",
  "format": "ITF"
}
```

| **Property** | **Required** | **Description**                                                                                                       |
| ------------ | ------------ | --------------------------------------------------------------------------------------------------------------------- |
| `layout`     | No           | Standard used to parse and explain the value: `BR_BOLETO`, `BR_ARRECADACAO`, `GTIN`, `ITF14`, `ISBN`, `GS1_128`      |
| `format`     | No           | Barcode symbology. When omitted, the layout default is used, and without layout `CODE128`. ⚠️ Case-sensitive          |

Available formats: `CODE128`, `CODE128A`, `CODE128B`, `CODE128C`, `CODE39`, `EAN13`, `EAN8`, `EAN5`, `EAN2`, `UPC`, `UPCE`, `ITF`, `ITF14`, `MSI`, `MSI10`, `MSI11`, `MSI1010`, `MSI1110`, `pharmacode`, `codabar`.

The plugin validates the json when the Column Definition is saved: unknown properties, unknown layouts/formats, or a format not compatible with the layout are rejected.

## Layouts

| **Layout**       | **Use case**                                | **Accepted value**                                                     | **Default format** | **Allowed formats**              |
| ---------------- | ------------------------------------------- | ---------------------------------------------------------------------- | ------------------ | -------------------------------- |
| `BR_BOLETO`      | Brazilian bank slip (FEBRABAN)              | 44-digit barcode or 47-digit *linha digitável* (masks are ignored)     | `ITF`              | `ITF`                            |
| `BR_ARRECADACAO` | Brazilian collection slip (utilities, taxes) | 44-digit barcode or 48-digit *linha digitável*, starting with `8`      | `ITF`              | `ITF`                            |
| `GTIN`           | Retail products                             | EAN-13, UPC-A (12), EAN-8 or GTIN-14 digits                            | by length          | `EAN13`, `UPC`, `EAN8`, `ITF14`  |
| `ITF14`          | Shipping boxes and pallets                  | 14 digits                                                              | `ITF14`            | `ITF14`                          |
| `ISBN`           | Books                                       | ISBN-13 (`978`/`979`) or ISBN-10, with or without hyphens              | `EAN13`            | `EAN13`                          |
| `GS1_128`        | Logistics labels                            | `(01)07891234567895(17)261231(10)LOT1` or raw digits with GS separators | `CODE128` (GS1)    | `CODE128`                        |

### BR_BOLETO

The *linha digitável* is converted to the 44-digit barcode before rendering. Breakdown: Bank, Currency, Check digit (mod 11), Due-date factor (converted to a date, handling the factor reset of 22/02/2025), Amount (BRL) and the 25-digit bank-specific field.

```json
{ "layout": "BR_BOLETO" }
```

### BR_ARRECADACAO

Breakdown: Product, Segment (city halls, water, electricity, telecom, government, companies, traffic fines...), Value type, Check digit (mod 10 or mod 11 according to the value type), Amount, Company (code or CNPJ root) and the company-specific field.

```json
{ "layout": "BR_ARRECADACAO" }
```

### GTIN

The format is chosen by the length of the value: 13 → `EAN13`, 12 → `UPC`, 8 → `EAN8`, 14 → `ITF14`. Breakdown: GS1 prefix (with the country where the company is registered), Company & item, and Check digit (GS1 mod 10).

```json
{ "layout": "GTIN" }
```

### ITF14

Breakdown: Packaging indicator, GS1 prefix (country), Company & item and Check digit.

```json
{ "layout": "ITF14" }
```

### ISBN

ISBN-10 values are converted to ISBN-13 (`978` prefix). Breakdown: Prefix, Group/publisher/title, Check digit and, for `978` codes, the equivalent ISBN-10.

```json
{ "layout": "ISBN" }
```

### GS1_128

Rendered as `CODE128` with GS1 (FNC1) encoding. Supported application identifiers:

| **AI**   | **Name**                 | **AI**   | **Name**                 |
| -------- | ------------------------ | -------- | ------------------------ |
| `00`     | SSCC (shipping container) | `21`     | Serial number            |
| `01`     | GTIN                     | `30`     | Count                    |
| `02`     | GTIN of contained items  | `37`     | Count of trade items     |
| `10`     | Batch / lot              | `400`    | Purchase order           |
| `11`     | Production date          | `410`    | Ship to (GLN)            |
| `13`     | Packaging date           | `422`    | Country of origin        |
| `15`     | Best before              | `310n`   | Net weight (kg)          |
| `17`     | Expiry date              | `330n`   | Gross weight (kg)        |
| `20`     | Variant                  | `392n`   | Amount payable           |

Dates (`YYMMDD`) are formatted, and for `310n` / `330n` / `392n` the 4th digit defines the decimal places. Any unknown AI hides the breakdown.

```json
{ "layout": "GS1_128" }
```

## Samples

```json
{}
```

```json
{ "format": "CODE39" }
```

```json
{ "layout": "GTIN", "format": "EAN13" }
```

## Notes

- `format` always wins over the layout default.
- If the value does not match the configured layout, the raw value is rendered using `format` (or `CODE128`) and the breakdown table is hidden.
- The Copy button always copies the raw cell value (i.e. the *linha digitável*, not the converted barcode).
