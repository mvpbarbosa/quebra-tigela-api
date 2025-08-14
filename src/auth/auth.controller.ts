import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register/user')
  registerUser(@Body() dto) {
    return this.auth.registerUser(dto);
  }

  @Post('register/artist')
  registerArtist(@Body() dto) {
    return this.auth.registerArtist(dto);
  }

  @Post('login')
  login(
    @Body()
    dto: {
      email: string;
      password: string;
      accountType?: 'client' | 'artist';
    },
  ) {
    return this.auth.login(
      dto.email,
      dto.password,
      dto.accountType ?? 'client',
    );
  }
}
