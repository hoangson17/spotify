import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

export class UserTracksDto {
  @IsUUID()
  userId!: string;

  @IsArray()
  @ArrayMaxSize(500)
  @IsUUID(undefined, { each: true })
  trackIds!: string[];
}
