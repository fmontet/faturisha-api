import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { DocumentsService } from '../documents/documents.service';
import { buildInvoiceHtml } from '../documents/templates/invoice.template';

@Injectable()
export class InvoicesService {
  constructor(private readonly documentService: DocumentsService) {}

  async generateInvoice(dto: CreateInvoiceDto) {
    const totals = this.documentService.calculateTotals(dto.items, dto.taxRate);
    const html = buildInvoiceHtml(dto, totals, this.documentService.utils);

    const pdfBuffer = await this.documentService.generatePdf(html);
    return { pdfBuffer, ...totals };
  }
}
