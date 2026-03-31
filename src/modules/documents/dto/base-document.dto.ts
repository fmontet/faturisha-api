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

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @IsString()
  @IsOptional()
  addressLine2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  postalCode?: string;
}

export class ItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  qty: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;
}

export class BaseDocumentDto {
  @IsString()
  @IsNotEmpty()
  sellerName: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  sellerAddress?: AddressDto;

  @IsString()
  @IsNotEmpty()
  buyerName: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  buyerAddress?: AddressDto;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  taxRate: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  @IsString()
  @IsNotEmpty()
  @Length(3, 3) // ISO 4217 currency codes are always 3 chars e.g. USD, KES, EUR
  currency: string;
}
