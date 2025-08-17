import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SellerModule } from './seller/seller.module';
import { DebtorModule } from './debtor/debtor.module';
import { DebtModule } from './debt/debt.module';
import { AuthModule } from './auth/auth.module';
import { SampleModule } from './sample/sample.module';
import { SmsModule } from './sms/sms.module';
import { MulterModule } from './multer/multer.module';
import { PaymentsModule } from './payments/payments.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/api/uploads', 
    }),
    AuthModule,
    PrismaModule,
    SellerModule,
    DebtorModule,
    DebtModule,
    PaymentsModule,
    SampleModule,
    SmsModule,
    MulterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
