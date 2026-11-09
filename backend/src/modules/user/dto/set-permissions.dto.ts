import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

export class SetPermissionsDto {
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  permissions!: string[];
}
