import { Body, Controller, Post } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ValidateResetCodeDto } from './dto/validate-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth/password-reset')
export class PasswordResetController {
  constructor(private readonly service: PasswordResetService) {}

  @Post('request')
  request(@Body() dto: RequestPasswordResetDto) {
    return this.service.requestReset(dto.email);
  }

  @Post('validate')
  validate(@Body() dto: ValidateResetCodeDto) {
    return this.service.validateCode(dto.email, dto.code);
  }

  @Post('reset')
  reset(@Body() dto: ResetPasswordDto) {
    return this.service.resetPassword(dto.email, dto.code, dto.newPassword);
  }
}