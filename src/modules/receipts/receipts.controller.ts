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
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Receipts')
@Controller('receipts')
export class ReceiptsController {
  private readonly logger = new Logger(ReceiptsController.name);
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a PDF receipt' })
  @ApiResponse({ status: 201, description: 'Receipt generated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 500, description: 'Failed to generate receipt' })
  async create(@Body() dto: CreateReceiptDto, @Res() res: express.Response) {
    try {
      const { pdfBuffer } = await this.receiptsService.generateReceipt(dto);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=receipt-${Date.now()}.pdf`,
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer, 'binary');
    } catch (error) {
      this.logger.error('Receipt generation failed:', error);
      throw new HttpException(
        'Failed to generate receipt',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
