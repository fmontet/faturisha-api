// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.

import { AddressDto } from './dto/base-document.dto';

export interface LineItem {
  name: string;
  qty: number;
  price: number;
}

export type CalculableItem = Pick<LineItem, 'qty' | 'price'>;

export interface Totals {
  subtotal: number;
  tax: number;
  total: number;
}

export interface TemplateUtils {
  escapeHtml: (str: string) => string;
  formatCurrency: (value: number, currency: string) => string;
  formatAddress: (name: string, address?: AddressDto) => string;
}

export function createTemplateUtils(
  escapeHtml: (str: string) => string,
  formatCurrency: (n: number, currency: string) => string,
): TemplateUtils {
  const e = escapeHtml;

  return {
    escapeHtml,
    formatCurrency,
    formatAddress: (name, address) => {
      const lines = [
        `<div>${e(name)}</div>`,
        address?.addressLine1
          ? `<div>${e(address.addressLine1)} ${e(address.addressLine2 ?? '')}</div>`
          : '',
        address?.city ? `<div>${e(address.city)}</div>` : '',
        address?.country
          ? `<div>${e(address.country)} ${e(address.postalCode ?? '')}</div>`
          : '',
      ];
      return lines.filter(Boolean).join('\n');
    },
  };
}
