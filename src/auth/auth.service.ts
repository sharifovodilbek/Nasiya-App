import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
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

    const user = await this.prisma.admin.findMany({
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
        role:true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const total = await this.prisma.admin.count({ where });

    return {
      data: user,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
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
