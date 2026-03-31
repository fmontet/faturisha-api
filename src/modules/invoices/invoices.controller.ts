import {
  Controller,
  Post,
  Body,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import express from 'express';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async create(@Body() dto: CreateInvoiceDto, @Res() res: express.Response) {
    try {
      const { pdfBuffer } = await this.invoicesService.generateInvoice(dto);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${Date.now()}.pdf`,
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer, 'binary');
    } catch (error) {
      console.error('Invoice generation failed:', error);
      throw new HttpException(
        'Failed to generate invoice',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
