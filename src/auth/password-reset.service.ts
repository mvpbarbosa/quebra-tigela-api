import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PasswordReset,
  PasswordResetDocument,
} from './schemas/password-reset.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Artist, ArtistDocument } from '../artists/schemas/artist.schema';
import { PasswordResetMailService } from '../mail/password-reset.mail.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectModel(PasswordReset.name)
    private resetModel: Model<PasswordResetDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Artist.name)
    private artistModel: Model<ArtistDocument>,
    private mailService: PasswordResetMailService,
  ) {}

  async requestReset(email: string) {
    const [user, artist] = await Promise.all([
      this.userModel.findOne({ email }),
      this.artistModel.findOne({ email }),
    ]);

    const found = user || artist;
    if (!found) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 6 * 60 * 1000); 

    await this.resetModel.create({ email, code, expiresAt, used: false });
    await this.mailService.sendResetCode(email, code);
    return { message: 'Código enviado para o e-mail' };
  }

  async validateCode(email: string, code: string) {
    const reset = await this.resetModel.findOne({ email, code, used: false });
    if (!reset || reset.expiresAt < new Date())
      throw new BadRequestException('Código inválido ou expirado');
    return { valid: true };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const reset = await this.resetModel.findOne({ email, code, used: false });
    if (!reset || reset.expiresAt < new Date())
      throw new BadRequestException('Código inválido ou expirado');

    let user = await this.userModel.findOne({ email });
    if (!user) user = await this.artistModel.findOne({ email });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    reset.used = true;
    await reset.save();

    return { message: 'Senha redefinida com sucesso' };
  }
}
