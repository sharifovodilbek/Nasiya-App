import { Module } from '@nestjs/common';
import { DebtorService } from './debtor.service';
import { DebtorController } from './debtor.controller';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '7d' },
    }),
    MailModule,
    PrismaModule],
  controllers: [DebtorController],
  providers: [DebtorService],
})
export class DebtorModule { }
