import { IsNotEmpty, IsString } from 'class-validator';

export class CompareFacesDto {
  @IsNotEmpty()
  @IsString()
  image1: string; 

  @IsNotEmpty()
  @IsString()
  image2: string; 
}