import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PayAsYouWishDto } from './dto/create-payment.dto';
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
  @Post('forOneMonth')
  @UseGuards(AuthGuard, RoleGuard)
  oneMonthPay(@Body() dto: CreatePaymentDto, @Req() req: Request) {
    const sellerId = (req as any).user.id
    return this.paymentsService.forOneMonth(dto, sellerId);
  }

  @RoleD(Role.SELLER)
  @Post('inAnyAmount')
  @UseGuards(AuthGuard, RoleGuard)
  payAsYouWish(@Body() dto: PayAsYouWishDto, @Req() req: Request) {
    const sellerId = (req as any).user.id
    return this.paymentsService.inAnyAmount(dto, sellerId);
  }

  @Post('availableMonths')
  getRemainingMonths(@Body() dto: RemainingMonthsDto) {
    return this.paymentsService.calculateRemainingMonths(dto);
  }


  @RoleD(Role.SELLER)
  @Post('forFewMonths')
  @UseGuards(AuthGuard, RoleGuard)
  multiMonthPay(@Body() dto: MultiMonthPayDto, @Req() req: Request) {
    const sellerId = (req as any).user.id
    return this.paymentsService.forFewMonths(dto, sellerId);
  }
}