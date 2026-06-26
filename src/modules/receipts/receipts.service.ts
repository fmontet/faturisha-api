import { Injectable } from '@nestjs/common';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { DocumentsService } from '../documents/documents.service';
import { buildReceiptHtml } from '../documents/templates/receipt.template';
import { LogoService } from '../documents/logo.service';

@Injectable()
export class ReceiptsService {
  constructor(
    private readonly documentService: DocumentsService,
    private readonly logoService: LogoService,
  ) {}

  async generateReceipt(dto: CreateReceiptDto) {
    const totals = this.documentService.calculateTotals(dto.items, dto.taxRate);
    const logoDataUrl = await this.logoService.resolveLogoDataUrl(dto.logoUrl);
    const html = buildReceiptHtml(
      dto,
      totals,
      this.documentService.utils,
      logoDataUrl,
    );

    const pdfBuffer = await this.documentService.generatePdf(html);
    return { pdfBuffer, ...totals };
  }
}
