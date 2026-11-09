import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateArtistDto {
  @IsString()
  @MaxLength(40)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;
}
