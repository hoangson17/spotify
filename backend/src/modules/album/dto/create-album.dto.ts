import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAlbumDto {
  @IsString()
  @MaxLength(100)
  title!: string;

  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @IsUUID()
  artist?: string | null;
}
