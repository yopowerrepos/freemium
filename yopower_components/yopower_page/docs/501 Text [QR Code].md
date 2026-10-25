# Text (QR Code)

- ✅ Single Line of Text and Multiple Lines of Text (Memo)
- ⚠️ Parameters are optional, an empty json `{}` renders any text as a QR code
- Shows a small QR code (32px) on the cell, hover shows the raw value as tooltip.
- Click the QR code to open a popover with a bigger version (256px) ready to be scanned from the screen.
- When a `layout` is informed and the value matches it, the popover also shows a breakdown table (Part / Value / Meaning) below the QR code.
- Values that cannot be encoded (i.e. too long for a QR code) display **Invalid QR code** instead of breaking the grid.
- Empty cells render nothing.

## Parameters

```json
{
  "layout": "PIX"
}
```

| **Property** | **Required** | **Description**                                                                                     |
| ------------ | ------------ | --------------------------------------------------------------------------------------------------- |
| `layout`     | No           | Payment layout used to explain the content on the popover: `PIX`, `EPC` or `SWISS_QR` (case-insensitive) |

The plugin validates the json when the Column Definition is saved: any property other than `layout`, or a layout not listed above, is rejected.

## Layouts

### PIX (Brazil – BR Code)

EMV merchant presented QR code used by Pix. The value must be the full "copia e cola" payload, i.e. `00020126...6304ABCD`.

| **Part**       | **Meaning**                                              |
| -------------- | -------------------------------------------------------- |
| Type           | Static (reusable) or Dynamic (single use)                |
| Pix key        | Receiver key (e-mail, phone, CPF/CNPJ or random key)     |
| Payload URL    | Dynamic charge location (dynamic Pix only)               |
| Description    | Free text informed by the receiver                       |
| Amount         | Formatted as BRL                                         |
| Receiver       | Merchant name                                            |
| City           | Merchant city                                            |
| Postal code    | Merchant postal code                                     |
| Transaction ID | Field 62-05                                              |
| CRC16          | `valid` / `invalid`, recalculated with CRC16-CCITT       |

### EPC (SEPA – GiroCode)

European Payments Council QR code for SEPA credit transfers. Lines separated by line breaks, starting with `BCD` and with `SCT` on the 4th line — use a **Multiple Lines of Text** column.

```text
BCD
002
1
SCT
BHBLDEHHXXX
Franz Mustermann
DE71110220330123456789
EUR12.30
GDDS
RF18539007547034
```

Shows Version, BIC, Beneficiary, IBAN (with mod 97 `valid` / `invalid`), Amount (formatted with its currency), Purpose, Reference, Remittance and Information.

### SWISS_QR (Swiss QR-bill)

Swiss Payments Code, lines separated by line breaks and starting with `SPC` — use a **Multiple Lines of Text** column.

Shows Version, IBAN (with mod 97 check), Creditor (with address), Amount, Currency, Debtor (with address), Reference type (`QRR`, `SCOR`, `NON`), Reference, Message and Billing information.

## Notes

- If the value does not match the configured layout, the QR code is still rendered, only the breakdown table is hidden.
- The QR code always encodes the raw cell value, the layout is used only for the explanation.
