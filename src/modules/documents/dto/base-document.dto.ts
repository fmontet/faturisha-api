import {
  IsString,
  IsNumber,
  IsArray,
  IsNotEmpty,
  IsPositive,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  Min,
  Max,
  IsOptional,
  MaxLength,
  IsISO4217CurrencyCode,
  IsUrl,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const MAX_ORG_NAME_LENGTH = 120;
const MAX_ADDRESS_LINE_LENGTH = 160;
const MAX_CITY_LENGTH = 80;
const MAX_COUNTRY_LENGTH = 80;
const MAX_POSTAL_CODE_LENGTH = 10;
const MAX_ITEM_NAME_LENGTH = 160;
const MAX_LINE_ITEMS = 100;
const MAX_ITEM_QUANTITY = 1_000_000;
const MAX_ITEM_UNIT_PRICE = 1_000_000_000;
const MAX_LOGO_URL_LENGTH = 2048;

export class AddressDto {
  @ApiProperty({ example: '123 Farm Road', maxLength: MAX_ADDRESS_LINE_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_ADDRESS_LINE_LENGTH)
  addressLine1!: string;

  @ApiPropertyOptional({
    example: 'Gate 5',
    maxLength: MAX_ADDRESS_LINE_LENGTH,
  })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_ADDRESS_LINE_LENGTH)
  addressLine2?: string;

  @ApiProperty({ example: 'Nairobi', maxLength: MAX_CITY_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_CITY_LENGTH)
  city!: string;

  @ApiPropertyOptional({
    example: 'Nairobi County',
    maxLength: MAX_CITY_LENGTH,
  })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_CITY_LENGTH)
  state?: string;

  @ApiProperty({ example: 'Kenya', maxLength: MAX_COUNTRY_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_COUNTRY_LENGTH)
  country!: string;

  @ApiPropertyOptional({ example: '00100', maxLength: MAX_POSTAL_CODE_LENGTH })
  @IsString()
  @IsOptional()
  @MaxLength(MAX_POSTAL_CODE_LENGTH)
  postalCode?: string;
}

export class ItemDto {
  @ApiProperty({ example: 'Grade 1A', maxLength: MAX_ITEM_NAME_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_ITEM_NAME_LENGTH)
  name!: string;

  @ApiProperty({ example: 100, maximum: MAX_ITEM_QUANTITY })
  @IsNumber()
  @IsPositive()
  @Max(MAX_ITEM_QUANTITY)
  qty!: number;

  @ApiProperty({ example: 120.75, maximum: MAX_ITEM_UNIT_PRICE })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(MAX_ITEM_UNIT_PRICE)
  price!: number;
}

export class BaseDocumentDto {
  @ApiProperty({
    example: 'Some Farm Limited',
    maxLength: MAX_ORG_NAME_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_ORG_NAME_LENGTH)
  sellerName!: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  sellerAddress?: AddressDto;

  @ApiProperty({ example: 'Green Limited', maxLength: MAX_ORG_NAME_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_ORG_NAME_LENGTH)
  buyerName!: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  buyerAddress?: AddressDto;

  @ApiProperty({ example: 16 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  taxRate!: number;

  @ApiProperty({ type: [ItemDto], maxItems: MAX_LINE_ITEMS })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_LINE_ITEMS)
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items!: ItemDto[];

  @ApiProperty({ example: 'KES', description: 'ISO 4217 currency code' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  @IsISO4217CurrencyCode()
  currency!: string;

  @ApiPropertyOptional({
    example: 'https://example.com/logo.png',
    description:
      'HTTPS URL for a PNG, JPEG, or WebP logo to display on the generated document',
    maxLength: MAX_LOGO_URL_LENGTH,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(MAX_LOGO_URL_LENGTH)
  logoUrl?: string;
}
