import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PayAsYouWishDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { RemainingMonthsDto } from './dto/RemainingMonths.dto';
import { MultiMonthPayDto } from './dto/MultiMonthlyPaydto';
import { RoleD } from 'src/seller/decorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @RoleD(Role.SELLER)
  @Post('one-month-pay')
  @UseGuards(AuthGuard,RoleGuard)
  oneMonthPay(@Body() dto: CreatePaymentDto, @Req() req: Request) {
    const sellerId = (req as any).user.id
    return this.paymentsService.oneMonthPay(dto, sellerId);
  }

  @RoleD(Role.SELLER)
  @Post('pay-as-you-wish')
  @UseGuards(AuthGuard,RoleGuard)
  payAsYouWish(@Body() dto: PayAsYouWishDto, @Req() req: Request) {
   const sellerId = (req as any).user.id
    return this.paymentsService.payAsYouWish(dto, sellerId);
  }

  @Post('remaining-months')
  getRemainingMonths(@Body() dto: RemainingMonthsDto) {
    return this.paymentsService.calculateRemainingMonths(dto);
  }


  @RoleD(Role.SELLER)
  @Post('multi-month-pay')
  @UseGuards(AuthGuard,RoleGuard)
  multiMonthPay(@Body() dto: MultiMonthPayDto, @Req() req: Request) {
    const sellerId = (req as any).user.id
    return this.paymentsService.multiMonthPay(dto, sellerId);
  }
}