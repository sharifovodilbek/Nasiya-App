import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SampleService {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: CreateSampleDto, sellerId: string) {
    try {
      return await this.prisma.sample.create({
        data: {
          note:data.note,
          seller: {
          connect: { id: sellerId },
        },
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
        { note: { contains: filter, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    }

    const sample = await this.prisma.sample.findMany({
      where,
      skip,
      take,
      orderBy: sortBy ? orderBy : { note: 'desc' },
      select: {
        id:true,
        note:true,
        isActive:true
      },
    });

    const total = await this.prisma.sample.count({ where });

    return {
      data: sample,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }

  async findOne(id: string) {
    const sample = await this.prisma.sample.findUnique({ where: { id } });
    if (!sample) throw new NotFoundException('Sample topilmadi');
    return sample;
  }

  async update(id: string, data: UpdateSampleDto) {
    const existing = await this.prisma.sample.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Yangilamoqchi bo‘lgan sample topilmadi');

    try {
      return await this.prisma.sample.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException('Yangilashda xatolik: ' + error.message);
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.sample.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('O‘chirilmoqchi bo‘lgan sample topilmadi');

    try {
      return await this.prisma.sample.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException('O‘chirishda xatolik: ' + error.message);
    }
  }
}
