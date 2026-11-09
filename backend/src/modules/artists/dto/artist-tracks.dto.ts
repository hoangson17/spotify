import { ArrayMaxSize, IsArray, IsOptional, IsUUID } from 'class-validator';

export class ArtistTracksDto {
  @IsUUID()
  artistId!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(500)
  @IsUUID(undefined, { each: true })
  trackId?: string[];
}
