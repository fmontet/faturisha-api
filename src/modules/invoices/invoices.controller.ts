import {
  Controller,
  Post,
  Body,
  Res,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import express from 'express';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Invoices')
@ApiSecurity('apiKey')
@Controller('invoices')
export class InvoicesController {
  private readonly logger = new Logger(InvoicesController.name);
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a PDF invoice' })
  @ApiResponse({ status: 201, description: 'Invoice generated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Missing or invalid API key' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
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
      this.logger.error('Invoice generation failed:', error);
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error instanceof HttpException
          ? error.message
          : 'Failed to generate invoice';

      throw new HttpException(message, status);
    }
  }
}
