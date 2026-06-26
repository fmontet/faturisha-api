import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { DocumentsService } from '../documents/documents.service';
import { buildInvoiceHtml } from '../documents/templates/invoice.template';
import { LogoService } from '../documents/logo.service';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly documentService: DocumentsService,
    private readonly logoService: LogoService,
  ) {}

  async generateInvoice(dto: CreateInvoiceDto) {
    const totals = this.documentService.calculateTotals(dto.items, dto.taxRate);
    const logoDataUrl = await this.logoService.resolveLogoDataUrl(dto.logoUrl);
    const html = buildInvoiceHtml(
      dto,
      totals,
      this.documentService.utils,
      logoDataUrl,
    );

    const pdfBuffer = await this.documentService.generatePdf(html);
    return { pdfBuffer, ...totals };
  }
}
