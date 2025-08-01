import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
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

@Controller('seller')
export class SellerController {
  constructor(private readonly authService: SellerService) { }

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
    return this.authService.findAll(filter, page, limit, sortBy, sortOrder);
  }


  @RoleD(Role.ADMIN)
  @Post('create')
  @UseGuards(AuthGuard, RoleGuard)
  async register(@Body() data: CreateSellerDto) {
    return await this.authService.post(data);
  }


  // @RoleD(Role.SELLER)
  @Post('login')
  // @UseGuards(AuthGuard, RoleGuard)
  async login(@Body() data: LoginSellerDto) {
    return await this.authService.login(data);
  }

  @Post('sent-otp')
  async requestReset(@Body() data: ResetRequestDto) {
    return this.authService.requestReset(data);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() data: VerifyOtpDto) {
    return this.authService.verifyOtp(data);
  }

  @Post('reset-password')
  async resetPassword(@Body() data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }

  @Post('refresh-token')
  async refreshToken(@Body() data: RefreshTokenDto) {
    return await this.authService.refreshToken(data);
  }

  @Patch(':id')
    update(@Param('id') id: string, @Body() data: UpdateSellerDto) {
      return this.authService.update(id, data);
    }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(id);
  }
}