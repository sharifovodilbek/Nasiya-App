import { Module } from '@nestjs/common';
import { SampleService } from './sample.service';
import { SampleController } from './sample.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
      JwtModule.register({
        secret: 'secret',
        signOptions: { expiresIn: '7d' },
      }),
      PrismaModule],
  controllers: [SampleController],
  providers: [SampleService],
})
export class SampleModule {}
