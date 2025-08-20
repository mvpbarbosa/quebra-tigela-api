import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateArtistDto {
  @IsString({ message: "O campo 'nome' deve ser um texto" })
  @IsNotEmpty({ message: "O campo 'nome' é obrigatório" })
  name: string;

  @IsEmail(
    {},
    { message: "O campo 'email' deve ser um endereço de e-mail válido" },
  )
  @IsNotEmpty({ message: "O campo 'email' é obrigatório" })
  email: string;

  @IsString({ message: "O campo 'senha' deve ser um texto" })
  @MinLength(6, { message: "O campo 'senha' deve ter no mínimo 6 caracteres" })
  @IsNotEmpty({ message: "O campo 'senha' é obrigatório" })
  password: string;

  @IsOptional()
  @IsString({ message: "O campo 'bio' deve ser um texto" })
  bio?: string;

  @IsOptional()
  @IsString({ message: "O campo 'cidade' deve ser um texto" })
  city?: string;

  @IsOptional()
  @IsString({ message: "O campo 'estado' deve ser um texto" })
  state?: string;

  @IsOptional()
  @IsBoolean({ message: "O campo 'verificado' deve ser verdadeiro ou falso" })
  verified?: boolean;

  @IsArray({ message: "O campo 'artTypes' deve ser uma lista de textos" })
  @IsNotEmpty({
    message: "O campo 'artTypes' é obrigatório e não pode estar vazio",
  })
  artTypes: string[];
}
