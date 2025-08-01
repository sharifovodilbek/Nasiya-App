import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import * as bcrypt from 'bcrypt';
import { LoginSellerDto } from './dto/login-seller.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { VerifyOtpDto } from './dto/verifyOtp.dto';
import { ResetRequestDto } from './dto/reset-request.dto';
import { RefreshTokenDto } from './dto/refreshtokenDto';

@Injectable()
export class SellerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mailService: MailService

  ) { }

  async findAll(
    filter: string,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc',
  ) {
    const take = Number(limit) || 10
    const skip = page ? (page - 1) * take : 0;

    const where: any = {};
    if (filter) {
      where.OR = [
        { name: { contains: filter, mode: 'insensitive' } },
        { phone: { contains: filter, mode: 'insensitive' } },
        { email: { contains: filter, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    }

    const sellers = await this.prisma.seller.findMany({
      where,
      skip,
      take,
      orderBy: sortBy ? orderBy : { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        password: true,
        email: true,
        passcode: true,
        wallet: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const total = await this.prisma.seller.count({ where });

    return {
      data: sellers,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }

  async post(data: CreateSellerDto) {
    const hashedPassword = bcrypt.hashSync(data.password, 10);

    const newSeller = await this.prisma.seller.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        passcode: data.passcode,
        wallet: data.wallet,
      },
    });

    return newSeller;
  }

  async login(data: LoginSellerDto) {
    console.log(data);

    const { email, password } = data;
    let seller = await this.prisma.seller.findUnique({ where: { email } });
    if (!seller) throw new NotFoundException('seller not found');

    let match = bcrypt.compareSync(password, seller.password);
    if (!match) throw new NotFoundException('wrong password');

    let token = this.jwt.sign({ id: seller.id, email: seller.email, role: seller.role });
    return { token };
  }

  async requestReset(data: ResetRequestDto) {
    const { email } = data;
    const seller = await this.prisma.seller.findUnique({ where: { email } });
    if (!seller) throw new NotFoundException('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.seller.update({
      where: { email },
      data: { resetOtp: otp, resetOtpExp: otpExpire, verified: false },
    });

    try {
      await this.mailService.sendEmail(
        email,
        'Parolni tiklash uchun OTP',
        `Sizning OTP kodingiz: ${otp}`
      );

    } catch (e) {
      console.error('Email yuborishda xatolik:', e.message);
      throw new BadRequestException('Email yuborishda xatolik yuz berdi');
    }

    return { message: 'OTP emailingizga yuborildi' };
  }

  async verifyOtp(data: VerifyOtpDto) {
    const { email, otp } = data;
    const seller = await this.prisma.seller.findUnique({ where: { email } });
    if (!seller) throw new NotFoundException('User not found');

    if (!seller.resetOtp || !seller.resetOtpExp)
      throw new BadRequestException('OTP so\'ralmagan');

    if (seller.resetOtp !== otp)
      throw new UnauthorizedException('Noto\'g\'ri OTP');

    if (seller.resetOtpExp < new Date())
      throw new BadRequestException('OTP eskirgan');

    await this.prisma.seller.update({
      where: { email },
      data: { verified: true },
    });

    return { message: 'OTP tasdiqlandi, parolni tiklashingiz mumkin' };
  }

  async resetPassword(data: ResetPasswordDto) {
    const { email, newPassword } = data;
    const seller = await this.prisma.seller.findUnique({ where: { email } });
    if (!seller) throw new NotFoundException('User not found');

    if (!seller.verified)
      throw new UnauthorizedException('OTP tasdig‘i talab qilinadi');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.seller.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExp: null,
        verified: true,
      },
    });

    return { message: 'Parol muvaffaqiyatli o‘zgartirildi' };
  }

  async getAccessToken(user: any) {
    return this.jwt.sign(
      {
        id: user.id,
        fullname: user.fullname,
        role: user.role,
        email: user.email,
        password: user.password,
        phone: user.phone,
      },
      { expiresIn: '1h' },
    );
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const user = this.jwt.verify(dto.refreshToken);

      return { accessToken: await this.getAccessToken(user) };
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  async update(id: string, data: UpdateSellerDto) {
    try {
      const existing = await this.prisma.seller.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException('Yangilamoqchi bo‘lgan seller topilmadi');
      }

      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
      }

      return await this.prisma.seller.update({ where: { id }, data });
    } catch (error) {
      throw new BadRequestException('Yangilashda xatolik: ' + error.message);
    }
  }

  async remove(id: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { id },
    });

    if (!seller) throw new NotFoundException('Seller not found');

    const deleted = await this.prisma.seller.delete({
      where: { id },
    });

    return { message: "This seller deleted", deleted };
  }
}