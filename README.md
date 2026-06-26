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

| Interface    | URL                                   | Best for                                         |
| ------------ | ------------------------------------- | ------------------------------------------------ |
| Swagger UI   | `http://localhost:3000/api/docs`      | Development & testing                            |
| Redoc        | `http://localhost:3000/api/redoc`     | Reading & sharing                                |
| OpenAPI JSON | `http://localhost:3000/api/docs-json` | Importing into Postman or generating client SDKs |

---

## Configuration

All runtime configuration is read from environment variables. Use `.env.example` as a template for local or hosted environment configuration. If you copy it to `.env`, make sure your shell, hosting platform, or process manager loads it before starting the API.

| Variable               | Default  | Description                                               |
| ---------------------- | -------- | --------------------------------------------------------- |
| `PORT`                 | `3000`   | HTTP port used by the API                                 |
| `LOCALE`               | `en-US`  | Locale used for currency formatting                       |
| `BODY_LIMIT`           | `1mb`    | Maximum JSON request body size                            |
| `ALLOWED_ORIGINS`      | disabled | Comma-separated CORS origins, or `*` to allow all origins |
| `RATE_LIMIT_MAX`       | `30`     | Maximum PDF generation requests per client per window     |
| `RATE_LIMIT_WINDOW_MS` | `60000`  | Rate-limit window in milliseconds                         |
| `API_KEY`              | unset    | Optional API key for PDF generation endpoints             |

Example:

```bash
PORT=3000 \
LOCALE=en-KE \
BODY_LIMIT=1mb \
ALLOWED_ORIGINS=https://app.example.com \
RATE_LIMIT_MAX=30 \
RATE_LIMIT_WINDOW_MS=60000 \
API_KEY=change-me \
pnpm start:prod
```

---

## Security

Faturisha does not prescribe a user or account model. For production deployments, place the API behind your own authentication layer, API gateway, or reverse proxy.

The API includes baseline deploy-safe guardrails:

- CORS is restricted by default. Set `ALLOWED_ORIGINS` to allow browser clients.
- JSON request bodies are limited by `BODY_LIMIT`.
- PDF generation endpoints are rate-limited with `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS`.
- If `API_KEY` is set, `POST /api/invoices` and `POST /api/receipts` require the `x-api-key` header.

The built-in rate limiter is in-memory and applies per running API process. For multi-instance production deployments, use an API gateway, reverse proxy, or platform-level rate limiting as the primary control.

Example authenticated request:

```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -H "x-api-key: change-me" \
  -d '{ "sellerName": "Avocado Farm", "buyerName": "Green Limited", "taxRate": 16, "currency": "KES", "items": [{ "name": "Grade 1A", "qty": 4000, "price": 120 }] }' \
  --output invoice.pdf
```

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
    { "name": "Grade 1A", "qty": 4000, "price": 120.0 },
    { "name": "Grade 1B", "qty": 3000, "price": 100.0 }
  ]
}
```

#### Fields

| Field           | Type   | Required | Description                                     |
| --------------- | ------ | -------- | ----------------------------------------------- |
| `sellerName`    | string | ✅       | Name of the seller                              |
| `sellerAddress` | object | ❌       | Seller address (see Address fields)             |
| `buyerName`     | string | ✅       | Name of the buyer                               |
| `buyerAddress`  | object | ❌       | Buyer address (see Address fields)              |
| `taxRate`       | number | ✅       | Tax rate as a percentage (0–100)                |
| `currency`      | string | ✅       | ISO 4217 currency code e.g. `KES`, `USD`, `EUR` |
| `items`         | array  | ✅       | Line items. At least one item required          |

#### Address Fields

| Field          | Type   | Required |
| -------------- | ------ | -------- |
| `addressLine1` | string | ✅       |
| `addressLine2` | string | ❌       |
| `city`         | string | ✅       |
| `state`        | string | ❌       |
| `country`      | string | ✅       |
| `postalCode`   | string | ❌       |

#### Item Fields

| Field   | Type   | Required | Description                                 |
| ------- | ------ | -------- | ------------------------------------------- |
| `name`  | string | ✅       | Line item name or description               |
| `qty`   | number | ✅       | Positive quantity                           |
| `price` | number | ✅       | Unit price. Supports up to 2 decimal places |

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
    { "name": "Grade 1A", "qty": 2000, "price": 120.0 },
    { "name": "Grade 1B", "qty": 1000, "price": 100.0 }
  ]
}
```

#### Additional Fields (beyond invoice)

| Field           | Type   | Required | Description                           |
| --------------- | ------ | -------- | ------------------------------------- |
| `transactionId` | string | ❌       | Unique transaction reference          |
| `paymentMethod` | string | ❌       | e.g. `MPESA`, `CASH`, `BANK TRANSFER` |

#### Response

Binary PDF file with headers:

```
Content-Type: application/pdf
Content-Disposition: attachment; filename=receipt-{timestamp}.pdf
```

---

### Health Check

**`GET /api/health`**

Returns:

```json
{ "status": "ok" }
```

---

## Error Responses

Validation errors return `400` responses. Unknown fields are rejected.

```json
{
  "message": ["currency must be a valid ISO4217 currency code"],
  "error": "Bad Request",
  "statusCode": 400
}
```

If `API_KEY` is configured and the request is missing or uses the wrong key:

```json
{
  "statusCode": 401,
  "message": "Missing or invalid API key",
  "error": "Unauthorized"
}
```

Rate-limited requests return:

```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Too Many Requests"
}
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
