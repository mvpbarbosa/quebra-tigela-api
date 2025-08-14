/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Artist, ArtistDocument } from '../artists/schemas/artist.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Artist.name) private artistModel: Model<ArtistDocument>,
    private jwt: JwtService,
  ) {}

  async registerUser(payload) {
    const { password, ...rest } = payload;
    const passwordHash = await bcrypt.hash(password, 10);
    const doc = new this.userModel({ ...rest, passwordHash, role: 'client' });
    await doc.save();
    return this.signToken({
      sub: doc._id.toString(),
      role: 'client',
      email: doc.email,
    });
  }

  async registerArtist(payload) {
    const { password, ...rest } = payload;
    const passwordHash = await bcrypt.hash(password, 10);
    const doc = new this.artistModel({
      ...rest,
      passwordHash,
      verified: !!rest.verified,
    });
    await doc.save();
    return this.signToken({
      sub: doc._id.toString(),
      role: 'artist',
      email: doc.email,
    });
  }

  async login(
    email: string,
    password: string,
    accountType: 'client' | 'artist' = 'client',
  ) {
    let entity;

    if (accountType === 'artist') {
      entity = await this.artistModel.findOne({ email });
    } else {
      entity = await this.userModel.findOne({ email });
    }

    if (!entity) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, entity.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const role = accountType === 'artist' ? 'artist' : 'client';
    return this.signToken({
      sub: entity._id.toString(),
      role,
      email: entity.email,
    });
  }

  private async signToken(payload) {
    return { access_token: await this.jwt.signAsync(payload) };
  }
}
