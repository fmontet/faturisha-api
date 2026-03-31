import { BaseDocumentDto } from '../../documents/dto/base-document.dto';
import { IsOptional, IsString } from 'class-validator';

export class CreateReceiptDto extends BaseDocumentDto {
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;
}
