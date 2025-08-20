import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateServiceOfferingDto {
  @IsMongoId() artistId: string;
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() media?: { type: 'image' | 'video'; url: string }[];
  @IsOptional() @IsBoolean() active?: boolean;
}
