import { Totals, TemplateUtils } from '../definitions';
import { CreateInvoiceDto } from '../../invoices/dto/create-invoice.dto';

export function buildInvoiceHtml(
  dto: CreateInvoiceDto,
  totals: Totals,
  utils: TemplateUtils,
) {
  const { subtotal, tax, total } = totals;
  const { escapeHtml, formatCurrency } = utils;

  const e = escapeHtml;
  const fmt = formatCurrency;

  const today = new Date().toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: "Helvetica Neue", Arial, sans-serif;
            padding: 40px;
            color: #333;
            font-size: 14px;
          }

          .invoice-box {
            max-width: 800px;
            margin: auto;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
          }

          .title {
            font-size: 28px;
            font-weight: bold;
          }

          .meta {
            text-align: right;
            font-size: 12px;
            color: #666;
          }

          .parties {
            margin-bottom: 30px;
          }

          .parties div {
            margin-bottom: 5px;
          }

          .section-title {
            font-weight: bold;
            margin-bottom: 5px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          thead {
            background: #f5f5f5;
          }

          th {
            text-align: left;
            padding: 10px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          td {
            padding: 10px;
            border-bottom: 1px solid #eee;
          }

          .right {
            text-align: right;
          }

          .totals {
            margin-top: 20px;
            width: 100%;
          }

          .totals table {
            width: 300px;
            margin-left: auto;
          }

          .totals td {
            padding: 8px;
          }

          .total-row {
            font-weight: bold;
            font-size: 16px;
            border-top: 2px solid #333;
          }

          .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #888;
            text-align: center;
          }
        </style>
      </head>

      <body>
        <div class="invoice-box">
          
          <div class="header">
            <div class="title">INVOICE</div>
            <div class="meta">
              <div><strong>Date:</strong> ${today}</div>
              <div><strong>Invoice #:</strong> ${Math.floor(Math.random() * 100000)}</div>
            </div>
          </div>

          <div class="parties">
            <div>
              <div class="section-title">Seller</div>
              <div>${e(dto.sellerName)}</div>
            </div>

            <br/>

            <div>
              <div class="section-title">Bill To</div>
              <div>${e(dto.buyerName)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="right">Qty</th>
                <th class="right">Unit Price</th>
                <th class="right">Tax</th>
                <th class="right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${dto.items
                .map((i) => {
                  const itemSubtotal = i.qty * i.price;
                  const itemTax =
                    // eslint-disable-next-line prettier/prettier
                    Math.round(((itemSubtotal * dto.taxRate) / 100) * 100) / 100;

                  return `
                    <tr>
                      <td>${e(i.name)}</td>
                      <td class="right">${i.qty}</td>
                      <td class="right">${fmt(i.price, dto.currency)}</td>
                      <td class="right">${fmt(itemTax, dto.currency)}</td>
                      <td class="right">${fmt(itemSubtotal, dto.currency)}</td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>

          <div class="totals">
            <table>
              <tr>
                <td>Subtotal</td>
                <td class="right">${fmt(subtotal, dto.currency)}</td>
              </tr>
              <tr>
                <td>Tax (${dto.taxRate}%)</td>
                <td class="right">${fmt(tax, dto.currency)}</td>
              </tr>
              <tr class="total-row">
                <td>Total</td>
                <td class="right">${fmt(total, dto.currency)}</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            Thank you for your business.
          </div>

        </div>
      </body>
    </html>
    `;
}
