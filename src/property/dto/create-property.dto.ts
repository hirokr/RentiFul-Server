import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';
import { PropertyType, Amenity, Highlight } from '@prisma/client';

export class CreatePropertyDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  pricePerMonth: number;

  @IsNumber()
  securityDeposit: number;

  @IsNumber()
  applicationFee: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(Amenity, { each: true })
  amenities?: Amenity[];

  @IsOptional()
  @IsArray()
  @IsEnum(Highlight, { each: true })
  highlights?: Highlight[];

  @IsBoolean()
  isPetsAllowed: boolean;

  @IsBoolean()
  isParkingIncluded: boolean;

  @IsNumber()
  beds: number;

  @IsNumber()
  baths: number;

  @IsNumber()
  squareFeet: number;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  // Location fields
  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsString()
  postalCode: string;
}