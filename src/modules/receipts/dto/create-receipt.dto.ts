import { BaseDocumentDto } from '../../documents/dto/base-document.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const MAX_PAYMENT_METHOD_LENGTH = 40;
const MAX_TRANSACTION_ID_LENGTH = 80;

export class CreateReceiptDto extends BaseDocumentDto {
  @ApiPropertyOptional({
    example: 'MPESA',
    description: 'Payment method used for the transaction',
    maxLength: MAX_PAYMENT_METHOD_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_PAYMENT_METHOD_LENGTH)
  paymentMethod?: string;

  @ApiPropertyOptional({
    example: 'TXN001ABC123',
    description: 'Unique identifier for the transaction',
    maxLength: MAX_TRANSACTION_ID_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_TRANSACTION_ID_LENGTH)
  transactionId?: string;
}
