import { Module } from '@nestjs/common';
import { MulterService } from './multer.service';
import { MulterController } from './multer.controller';

@Module({
  controllers: [MulterController],
  providers: [MulterService],
})
export class MulterModule {}
