import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

const emptyToNull = ({ value }: { value: unknown }) =>
  value === '' ? null : value;

export class CreateTrackDto {
  @IsString()
  @MaxLength(100)
  title!: string;

  @Transform(emptyToNull)
  @IsOptional()
  @IsUUID()
  album?: string | null;

  @Transform(emptyToNull)
  @IsOptional()
  @IsUUID()
  category?: string | null;

  @Transform(emptyToNull)
  @IsOptional()
  @IsUUID()
  artistId?: string | null;

  @IsOptional()
  duration?: string | number;
}
