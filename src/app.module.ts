import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArtistsModule } from './artists/artists.module';
import { ServicesModule } from './services/services.module';
import { ScheduleModule } from './schedule/schedule.module';
import { RequestsModule } from './requests/requests.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI
        ? process.env.MONGODB_URI
        : 'mongodb://localhost:27017/myapp',
    ),
    AuthModule,
    UsersModule,
    ArtistsModule,
    ServicesModule,
    ScheduleModule,
    RequestsModule,
    ReviewsModule,
  ],
})
export class AppModule {}
