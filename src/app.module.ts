import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArtistsModule } from './artists/artists.module';
import { ServicesModule } from './services.module';
import { ServicesService } from './services/services.service';
import { ServicesController } from './services/services.controller';
import { ScheduleModule } from './schedule/schedule.module';
import { RequestsModule } from './requests/requests.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [ConfigModule, AuthModule, UsersModule, ArtistsModule, ServicesModule, ScheduleModule, RequestsModule, ReviewsModule],
  controllers: [AppController, ServicesController],
  providers: [AppService, ServicesService],
})
export class AppModule {}
