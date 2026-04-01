import { Injectable } from '@nestjs/common';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { DocumentsService } from '../documents/documents.service';
import { buildReceiptHtml } from '../documents/templates/receipt.template';

@Injectable()
export class ReceiptsService {
  constructor(private readonly documentService: DocumentsService) {}

  async generateReceipt(dto: CreateReceiptDto) {
    const totals = this.documentService.calculateTotals(dto.items, dto.taxRate);
    const html = buildReceiptHtml(
      dto,
      totals,
      this.documentService.utils,
      this.documentService.logoDataUrl,
    );

    const pdfBuffer = await this.documentService.generatePdf(html);
    return { pdfBuffer, ...totals };
  }
}
