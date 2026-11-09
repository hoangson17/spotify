import { ArrayMaxSize, IsArray, IsOptional, IsUUID } from 'class-validator';

export class PlaylistTracksDto {
  @IsUUID()
  playlistId!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(500)
  @IsUUID(undefined, { each: true })
  trackIds?: string[];
}
