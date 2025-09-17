import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PasswordReset,
  PasswordResetSchema,
} from './schemas/password-reset.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Artist, ArtistSchema } from '../artists/schemas/artist.schema';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetController } from './password-reset.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PasswordReset.name, schema: PasswordResetSchema },
      { name: User.name, schema: UserSchema },
      { name: Artist.name, schema: ArtistSchema },
    ]),
    MailModule,
  ],
  controllers: [PasswordResetController],
  providers: [PasswordResetService],
})
export class PasswordResetModule {}
