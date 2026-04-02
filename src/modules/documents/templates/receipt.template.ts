import { Totals, TemplateUtils } from '../definitions';
import { CreateReceiptDto } from '../../receipts/dto/create-receipt.dto';

export function buildReceiptHtml(
  dto: CreateReceiptDto,
  totals: Totals,
  utils: TemplateUtils,
  logoDataUrl: string | null = null,
) {
  const { subtotal, tax, total } = totals;
  const { escapeHtml, formatCurrency, formatAddress } = utils;

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
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #333;
            font-size: 14px;
          }

          .receipt-box {
            max-width: 750px;
            margin: auto;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .title {
            font-size: 26px;
            font-weight: bold;
          }

          .status {
            background: #28a745;
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
          }

          .meta {
            margin-top: 10px;
            font-size: 12px;
            color: #666;
          }

          .section {
            margin-top: 20px;
          }

          .section-title {
            font-weight: bold;
            margin-bottom: 5px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th {
            background: #f5f5f5;
            padding: 10px;
            font-size: 12px;
            text-align: left;
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
          }

          .totals table {
            width: 320px;
            margin-left: auto;
          }

          .total-row {
            font-weight: bold;
            font-size: 16px;
            border-top: 2px solid #333;
          }

          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #777;
          }
          .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .logo {
            max-height: 60px;
            max-width: 180px;
            object-fit: contain;
          }
        </style>
      </head>

      <body>
        <div class="receipt-box">

          <div class="header">
            <div class="header-left">
              ${logoDataUrl ? `<img src="${logoDataUrl}" class="logo" alt="Logo" />` : ''}
              <div class="title">RECEIPT</div>
            </div>
            
            <div class="status">PAID</div>
          </div>

          <div class="meta">
            <div><strong>Date:</strong> ${today}</div>
            <div><strong>Receipt #:</strong> ${Math.floor(Math.random() * 100000)}</div>
            ${
              dto.transactionId
                ? `<div><strong>Transaction ID:</strong> ${e(dto.transactionId)}</div>`
                : ''
            }
          </div>

          <div class="section">
            <div class="section-title">Received From</div>
            ${formatAddress(dto.buyerName, dto.buyerAddress)}
          </div>

          <div class="section">
            <div class="section-title">Paid To</div>
            ${formatAddress(dto.sellerName, dto.sellerAddress)}
          </div>

          ${
            dto.paymentMethod
              ? `
            <div class="section">
              <div class="section-title">Payment Method</div>
              <div>${e(dto.paymentMethod)}</div>
            </div>
          `
              : ''
          }

          <table>
            <thead>
              <tr>
                <th>Description</th>
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
                  const lineTotal = itemSubtotal + itemTax;

                  return `
                    <tr>
                      <td>${e(i.name)}</td>
                      <td class="right">${i.qty}</td>
                      <td class="right">${fmt(i.price, dto.currency)}</td>
                      <td class="right">${fmt(itemTax, dto.currency)}</td>
                      <td class="right">${fmt(lineTotal, dto.currency)}</td>
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
                <td>Total Paid</td>
                <td class="right">${fmt(total, dto.currency)}</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            Payment received. Thank you for your business.
          </div>

        </div>
      </body>
    </html>
    `;
}
