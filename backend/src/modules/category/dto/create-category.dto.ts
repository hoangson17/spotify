import { Transform } from 'class-transformer';
import { IsHexColor, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string | null;

  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @IsHexColor()
  hexHexadecimal?: string | null;
}
