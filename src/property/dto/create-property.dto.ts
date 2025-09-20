import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { PropertyType, Amenity, Highlight } from '@prisma/client';

export class CreatePropertyDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  pricePerMonth: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  securityDeposit: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  applicationFee: number;

  @IsOptional()
  amenities?: any[];

  @IsOptional()
  highlights?: any[];

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isPetsAllowed: boolean;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isParkingIncluded: boolean;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  beds: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  baths: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  squareFeet: number;

  @IsEnum(['Rooms', 'Tinyhouse', 'Apartment', 'Villa', 'Townhouse', 'Cottage'])
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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];
}