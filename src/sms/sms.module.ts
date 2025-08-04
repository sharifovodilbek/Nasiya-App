import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
      JwtModule.register({
        secret: 'secret',
        signOptions: { expiresIn: '7d' },
      }),
      PrismaModule],
  controllers: [SmsController],
  providers: [SmsService],
})
export class SmsModule {}
