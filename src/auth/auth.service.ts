import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwt: JwtService,
  ) { }

  async register(data: CreateAuthDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.admin.create({
      data: {
        ...data,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
  }

  async login(dto: LoginAuthDto) {
    const admin = await this.prisma.admin.findFirst({
      where: { email: dto.email, role: 'ADMIN' },
    });

    if (!admin) {
      throw new UnauthorizedException('Bunday admin mavjud emas');
    }

    const passwordMatches = await bcrypt.compare(dto.password, admin.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Parol noto\'g\'ri');
    }

    const token = this.jwt.sign({ id: admin.id, role: admin.role });
    return { message: 'Succesfully login', token };
  }

  async getAllAdmins(query: {
    search?: string;
    sortBy?: 'name' | 'email' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;

    const admins = await this.prisma.admin.findMany({
      where: {
        role: 'ADMIN',
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    const total = await this.prisma.admin.count({
      where: {
        role: 'ADMIN',
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      },
    });

    return {
      data: admins,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAdminById(id: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });

    if (!admin || admin.role !== 'ADMIN') {
      throw new NotFoundException('Admin topilmadi');
    }

    return admin;
  }

  async updateAdmin(id: string, dto: UpdateAuthDto) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });

    if (!admin || admin.role !== 'ADMIN') {
      throw new NotFoundException('Admin topilmadi');
    }

    return this.prisma.admin.update({
      where: { id },
      data: dto,
    });
  }

  async deleteAdmin(id: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });

    if (!admin || admin.role !== 'ADMIN') {
      throw new NotFoundException('Admin topilmadi');
    }

    return this.prisma.admin.delete({ where: { id } });
  }
}
