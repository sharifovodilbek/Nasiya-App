import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { SellerService } from './seller.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { LoginSellerDto } from './dto/login-seller.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { VerifyOtpDto } from './dto/verifyOtp.dto';
import { ResetRequestDto } from './dto/reset-request.dto';
import { RefreshTokenDto } from './dto/refreshtokenDto';
import { ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { Role } from '@prisma/client';
import { RoleD } from './decorator';
import { PaymentDto } from './dto/payment.dto';
import { LateDebtor } from './dto/deniedPayments.dto';

@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) { }

  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'filter', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(
    @Query('filter') filter: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    return this.sellerService.findAll(filter, page, limit, sortBy, sortOrder);
  }

  @RoleD(Role.SELLER)
  @Get('totalMonth')
  @UseGuards(AuthGuard, RoleGuard)
  totalMonth(@Req() req: Request) {
    const sellerId = (req as any).user.id;
    return this.sellerService.totalMonth(sellerId);
  }

  @RoleD(Role.SELLER)
  @Post('fillBalance')
  @UseGuards(AuthGuard, RoleGuard)
  payment(@Body() paymentDto: PaymentDto, @Req() req: Request) {
    const sellerId = (req as any).user.id;
    return this.sellerService.payment(paymentDto.money, sellerId);
  }

  @RoleD(Role.ADMIN)
  @Post('create')
  @UseGuards(AuthGuard, RoleGuard)
  async register(@Body() data: CreateSellerDto) {
    return await this.sellerService.post(data);
  }

  @Post('login')
  async login(@Body() data: LoginSellerDto) {
    return await this.sellerService.login(data);
  }

  @Post('sent-otp')
  async requestReset(@Body() data: ResetRequestDto) {
    return this.sellerService.requestReset(data);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() data: VerifyOtpDto) {
    return this.sellerService.verifyOtp(data);
  }

  @Post('reset-password')
  async resetPassword(@Body() data: ResetPasswordDto) {
    return this.sellerService.resetPassword(data);
  }

  @Post('refresh-token')
  async refreshToken(@Body() data: RefreshTokenDto) {
    return await this.sellerService.refreshToken(data);
  }

  @RoleD(Role.SELLER)
  @Get('denied-Payments')
  @UseGuards(AuthGuard, RoleGuard)
  deniedPayments(@Req() req: Request): Promise<{
    sellerId: string;
    lateDebtorsCount: number;
    lateDebtors: LateDebtor[];
  }> {
    const sellerId = (req as any).user.id;
    return this.sellerService.DeniedPayments(sellerId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateSellerDto) {
    return this.sellerService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sellerService.remove(id);
  }
}