import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePlaylistDto {
  @IsString()
  @MaxLength(100)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsIn([0, 1, '0', '1'])
  is_public?: 0 | 1 | '0' | '1';
}
