import { BaseDocumentDto } from '../../documents/dto/base-document.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReceiptDto extends BaseDocumentDto {
  @ApiPropertyOptional({
    example: 'MPESA',
    description: 'Payment method used for the transaction',
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    example: 'TXN001ABC123',
    description: 'Unique identifier for the transaction',
  })
  @IsOptional()
  @IsString()
  transactionId?: string;
}
