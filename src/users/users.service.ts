import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  async create(dto: CreateUserDto) {
    try {
      const { password, ...rest } = dto;
      const passwordHash = await bcrypt.hash(password, 10);
      const user = new this.model({ ...rest, passwordHash, role: 'client' });
      await user.save();
      const obj = user.toObject();
      delete (obj as { passwordHash?: string }).passwordHash;
      return obj;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException(
          `O campo '${Object.keys(error.keyPattern)[0]}' com valor '${Object.values(error.keyValue)[0]}' já está em uso.`,
        );
      }
      if (error.name === 'ValidationError') {
        throw new BadRequestException('Erro de validação: ' + error.message);
      }
      throw new InternalServerErrorException(
        'Erro ao criar usuário: ' + error.message,
      );
    }
  }

  async findAll(): Promise<User[]> {
    return this.model.find().select('-passwordHash').lean();
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.model.findById(id).select('-passwordHash').lean();
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: string, dto: Partial<CreateUserDto>): Promise<User> {
    if (dto.password) {
      const passwordHash = await bcrypt.hash(dto.password, 10);
      const { password, ...rest } = dto;
      Object.assign(rest, { passwordHash });
      dto = rest;
    }
    const updated = await this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .select('-passwordHash')
      .lean();
    if (!updated) throw new NotFoundException('Usuário não encontrado');
    return updated as User;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.model.deleteOne({ _id: id });
    if (result.deletedCount === 0)
      throw new NotFoundException('Usuário não encontrado');
    return { deleted: true };
  }
}
