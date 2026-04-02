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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a PDF invoice' })
  @ApiResponse({ status: 201, description: 'Invoice generated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 500, description: 'Failed to generate invoice' })
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
