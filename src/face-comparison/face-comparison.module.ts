import { Module } from '@nestjs/common';
import { FaceComparisonService } from './face-comparison.service';
import { FaceComparisonController } from './face-comparison.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, 
        files: 2, 
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(
            new Error('Apenas arquivos JPG, JPEG, PNG e WEBP são permitidos'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  ],
  controllers: [FaceComparisonController],
  providers: [FaceComparisonService],
  exports: [FaceComparisonService], 
})
export class FaceComparisonModule {}
