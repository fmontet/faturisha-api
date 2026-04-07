import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import { CalculableItem, createTemplateUtils } from './definitions';
import { join } from 'path';
import { readFile } from 'fs/promises';

@Injectable()
export class DocumentsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DocumentsService.name);
  private browser: Browser;
  public logoDataUrl: string | null = null;

  async onModuleInit() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const logoBuffer = await readFile(
        join(__dirname, '..', '..', 'assets', 'sample-logo.png'),
      );
      this.logoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      this.logger.log('Logo loaded successfully');
    } catch {
      // No logo found — templates will render without it
      this.logoDataUrl = null;
      this.logger.log('No logo found, proceeding without it');
    }
  }

  async onModuleDestroy() {
    await this.browser?.close();
  }

  calculateTotals(items: CalculableItem[], taxRate: number) {
    const subtotalCents = items.reduce(
      (sum, item) => sum + item.qty * Math.round(item.price * 100),
      0,
    );

    const subtotal = subtotalCents / 100;
    const tax = Math.round(((subtotal * taxRate) / 100) * 100) / 100;
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }

  utils = createTemplateUtils(
    (s) => this.escapeHtml(s),
    (n, currency) =>
      new Intl.NumberFormat(process.env.LOCALE ?? 'en-US', {
        style: 'currency',
        currency,
      }).format(n),
  );

  async generatePdf(html: string) {
    const page = await this.browser.newPage();

    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });
      return await page.pdf({ format: 'A4', printBackground: true });
    } finally {
      await page.close();
    }
  }

  escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
