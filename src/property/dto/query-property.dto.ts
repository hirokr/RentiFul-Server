import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryPropertyDto {
  @IsOptional()
  @IsString()
  favoriteIds?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  priceMin?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  priceMax?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  beds?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  baths?: number;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  squareFeetMin?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  squareFeetMax?: number;

  @IsOptional()
  @IsString()
  amenities?: string;

  @IsOptional()
  @IsString()
  availableFrom?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  longitude?: number;
}