import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

@Injectable()
export class DebtService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createDebtDto: CreateDebtDto) {
    return await this.prisma.debt.create({
      data: createDebtDto,
      include: {
        ImagesOfDebt: true
      }
    });
  }

  async findAll(query: any) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minAmount,
      maxAmount,
      status,
    } = query;

    const filters: any = {};

    if (minAmount) filters.amount = { gte: Number(minAmount) };
    if (maxAmount) filters.amount = { ...filters.amount, lte: Number(maxAmount) };
    if (status) filters.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      this.prisma.debt.findMany({
        where: filters,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          ImagesOfDebt: true
        }
      }),
      this.prisma.debt.count({ where: filters }),
    ]);

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      data,

    };
  }

  async findOne(id: string) {
    const debt = await this.prisma.debt.findUnique({
      where: { id },
      include: {
        ImagesOfDebt: true
      }
    },
    );
    if (!debt) {
      throw new NotFoundException('Debt topilmadi');
    }
    return debt;
  }

  async update(id: string, updateDebtDto: UpdateDebtDto) {
    const existing = await this.prisma.debt.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Yangilamoqchi b\'lgan debt topilmadi');
    }
    return await this.prisma.debt.update({ where: { id }, data: updateDebtDto });
  }

  async remove(id: string) {
    const existing = await this.prisma.debt.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('O\'chirmoqchi bo\'lgan debt topilmadi');
    }
    return await this.prisma.debt.delete({ where: { id } });
  }
}
