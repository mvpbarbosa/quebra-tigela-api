import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class VerifyIdentityDto {
  @IsNotEmpty()
  @IsString()
  userPhoto: string; 

  @IsNotEmpty()
  @IsString()
  documentPhoto: string;

  @IsOptional()
  @IsString()
  artistId?: string; 
}
