import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSmDto } from './dto/create-sm.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SmsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: CreateSmDto, sellerId: string) {
    try {
      return await this.prisma.sms.create({
        data: {
          text: data.text,
          debtorId: data.debtorId,
          sellerId
        },
      });
    } catch (error) {
      throw new BadRequestException('Yaratishda xatolik: ' + error.message);
    }
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
        { text: { contains: filter, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    }

    const sms = await this.prisma.sms.findMany({
      where,
      skip,
      take,
      orderBy: sortBy ? orderBy : { text: 'desc' },
      select: {
        id: true,
        text: true,
        isSend: true,
        createdAt:true
      },
    });

    const total = await this.prisma.sms.count({ where });

    return {
      data: sms,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }

  async findOne(id: string) {
    const sms = await this.prisma.sms.findUnique({ where: { id } });
    if (!sms) throw new NotFoundException('Sample topilmadi');
    return sms;
  }

  async remove(id: string) {
    const existing = await this.prisma.sms.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('O\'chirilmoqchi bo\'lgan sms topilmadi');

    try {
      return await this.prisma.sms.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException('O\'chirishda xatolik: ' + error.message);
    }
  }
}