import {
  Controller,
  Post,
  Body,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import express from 'express';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';

@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post()
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
      console.error('Receipt generation failed:', error);
      throw new HttpException(
        'Failed to generate receipt',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
