import {
  IsString,
  IsNumber,
  IsArray,
  IsNotEmpty,
  IsPositive,
  ValidateNested,
  ArrayMinSize,
  Min,
  Max,
  Length,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({ example: '123 Farm Road' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Gate 5' })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ example: 'Nairobi' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ example: 'Nairobi County' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: 'Kenya' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({ example: '00100' })
  @IsString()
  @IsOptional()
  postalCode?: string;
}

export class ItemDto {
  @ApiProperty({ example: 'Grade 1A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsPositive()
  qty: number;

  @ApiProperty({ example: 120.75 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;
}

export class BaseDocumentDto {
  @ApiProperty({ example: 'Some Farm Limited' })
  @IsString()
  @IsNotEmpty()
  sellerName: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  sellerAddress?: AddressDto;

  @ApiProperty({ example: 'Green Limited' })
  @IsString()
  @IsNotEmpty()
  buyerName: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  buyerAddress?: AddressDto;

  @ApiProperty({ example: 16 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  taxRate: number;

  @ApiProperty({ type: [ItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  @ApiProperty({ example: 'KES', description: 'ISO 4217 currency code' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3) // ISO 4217 currency codes are always 3 chars e.g. USD, KES, EUR
  currency: string;
}
