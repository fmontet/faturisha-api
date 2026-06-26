<p align="center">
  <img src="src/assets/sample-logo.png" width="120" alt="Faturisha Logo" />
</p>

# Faturisha API
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight NestJS API for generating professional PDF invoices and receipts. No database required — pass in your data, get back a PDF.

---

## Features

- Generate PDF invoices with line items, tax, and seller/buyer details
- Generate PDF receipts with payment method and transaction ID
- Optional address blocks for seller and buyer
- Multi-currency support via ISO 4217 currency codes
- XSS-safe HTML rendering via input sanitization
- Zero database dependency — stateless by design

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Installation

```bash
git clone https://github.com/fmontet/faturisha-api.git
cd faturisha-api
pnpm install
pnpm exec puppeteer browsers install chrome
```

> **Note:** The Puppeteer Chrome install step is required. pnpm does not run postinstall scripts automatically.


### Running

```bash
# Development
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

### Tests

```bash
pnpm test
```

---

## Documentation

Once running, two interactive API documentation interfaces are available:

| Interface | URL | Best for |
|---|---|---|
| Swagger UI | `http://localhost:3000/api/docs` | Development & testing |
| Redoc | `http://localhost:3000/api/redoc` | Reading & sharing |
| OpenAPI JSON | `http://localhost:3000/api/docs-json` | Importing into Postman or generating client SDKs |
Place 

---

## API Endpoints

All endpoints are prefixed with `/api`.

---

### Generate Invoice

**`POST /api/invoices`**

Returns a PDF invoice as a binary file download.

#### Request Body

```json
{
  "sellerName": "Avocado Farm",
  "sellerAddress": {
    "addressLine1": "123 Farm Road",
    "city": "Nairobi",
    "country": "Kenya",
    "postalCode": "00100"
  },
  "buyerName": "Green Limited",
  "buyerAddress": {
    "addressLine1": "456 Green Street",
    "city": "Mombasa",
    "country": "Kenya"
  },
  "taxRate": 16,
  "currency": "KES",
  "items": [
    { "name": "Grade 1A", "qty": 4000, "price": 120.00 },
    { "name": "Grade 1B", "qty": 3000, "price": 100.00 }
  ],
}
```

#### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `sellerName` | string | ✅ | Name of the seller |
| `sellerAddress` | object | ❌ | Seller address (see Address fields) |
| `buyerName` | string | ✅ | Name of the buyer |
| `buyerAddress` | object | ❌ | Buyer address (see Address fields) |
| `taxRate` | number | ✅ | Tax rate as a percentage (0–100) |
| `currency` | string | ✅ | ISO 4217 currency code e.g. `KES`, `USD`, `EUR` |
| `items` | array | ✅ | At least one line item required |

#### Address Fields

| Field | Type | Required |
|---|---|---|
| `addressLine1` | string | ✅ |
| `addressLine2` | string | ❌ |
| `city` | string | ✅ |
| `country` | string | ✅ |
| `postalCode` | string | ❌ |

#### Response

Binary PDF file with headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename=invoice-{timestamp}.pdf
```

---

### Generate Receipt

**`POST /api/receipts`**

Returns a PDF receipt as a binary file download.

#### Request Body

```json
{
  "sellerName": "Some Farm Limited",
  "buyerName": "Green Limited",
  "taxRate": 0,
  "currency": "KES",
  "transactionId": "12345HAB",
  "paymentMethod": "MPESA",
  "items": [
    { "name": "Grade 1A", "qty": 2000, "price": 120.00 },
    { "name": "Grade 1B", "qty": 1000, "price": 100.00 }
  ],
}
```

#### Additional Fields (beyond invoice)

| Field | Type | Required | Description |
|---|---|---|---|
| `transactionId` | string | ✅ | Unique transaction reference |
| `paymentMethod` | string | ✅ | e.g. `MPESA`, `CASH`, `BANK TRANSFER` |

#### Response

Binary PDF file with headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename=receipt-{timestamp}.pdf
```

---

## Project Structure

```
src/
  modules/
    invoices/
      dto/
      invoices.controller.ts
      invoices.module.ts
      invoices.service.ts
    receipts/
      dto/
      receipts.controller.ts
      receipts.module.ts
      receipts.service.ts
    documents/
      dto/
      templates/
        invoice.template.ts
        receipt.template.ts
      definitions.ts
      documents.module.ts
      documents.service.ts
  app.controller.ts
  app.module.ts
  main.ts
test/
```

<!-- ---

## Extending

### Adding a customers module

Customer management is intentionally out of scope. Seller and buyer details are passed in the request body. A customers module can be added on top of this API by:

1. Adding Prisma and a `customers` table
2. Creating a `customers` module with CRUD endpoints
3. Accepting a `customerId` in the invoice/receipt DTO and resolving the name from the DB -->

---

## Tech Stack

- [NestJS](https://nestjs.com)
- [Puppeteer](https://pptr.dev) — PDF generation via headless Chrome
- [class-validator](https://github.com/typestack/class-validator) — request validation
- [class-transformer](https://github.com/typestack/class-transformer) — DTO transformation
