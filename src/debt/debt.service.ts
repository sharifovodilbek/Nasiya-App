import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { data } from 'react-router-dom';
import { connect } from 'http2';

@Injectable()
export class DebtService {
  constructor(private readonly prisma: PrismaService) { }

 async create(dto: CreateDebtDto) {
    const debtor = await this.prisma.debtor.findUnique({
      where: { id: dto.debtorId },
    });
    if (!debtor) {
      throw new BadRequestException('Debtor id not found!');
    }

    const createAt = new Date();
    const termDate = new Date(dto.term);

    if (termDate <= createAt) {
      throw new BadRequestException('Term date must be in the future');
    }

    const monthsDiff =
      (termDate.getFullYear() - createAt.getFullYear()) * 12 +
      (termDate.getMonth() - createAt.getMonth());

    if (monthsDiff <= 0) {
      throw new BadRequestException('Term difference must be at least 1 month');
    }

    const monthlyPayment = Math.ceil(dto.total / monthsDiff);

    const debt = await this.prisma.debt.create({
      data: {
        startDate:dto.startDate,
        name: dto.name,
        term: termDate.toISOString(),
        total: dto.total,
        note: dto.note,
        debtorId: dto.debtorId,
        monthlyPayment,
      },
      include: {
        Debtor: true,
      },
    });

    if (dto.images && dto.images.length > 0) {
      await Promise.all(
        dto.images.map(async (item) => {
          await this.prisma.imageOfDebt.create({
            data: {
              debtId: debt.id,
              image: item,
            },
          });
        }),
      );
    }

    const fullBorrowedProduct = await this.prisma.debt.findUnique({
      where: { id: debt.id },
      include: {
        Debtor: true,
        ImagesOfDebt: true,
      },
    });

    return fullBorrowedProduct;
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

    const debt = await this.prisma.debt.findMany({
      where,
      skip,
      take,
      orderBy: sortBy ? orderBy : { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        startDate: true,
        term: true,
        note: true,
        debtorId: true,
        paymentHistory:true,
        createdAt: true,
        updatedAt: true,
        ImagesOfDebt: {
          select: {
            image: true
          }
        }
      },
    });

    const total = await this.prisma.debt.count({ where });

    return {
      data: debt,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
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

  async update(id: string, data: UpdateDebtDto) {
  const existing = await this.prisma.debt.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundException("Yangilamoqchi bo'lgan debt topilmadi");
  }

  if (data.debtorId) {
  const debtor = await this.prisma.debtor.findUnique({
    where: { id: data.debtorId }
  });
  if (!debtor) {
    throw new BadRequestException('Berilgan debtorId bo‘yicha qarzdor topilmadi');
  }
}


  const updated = await this.prisma.debt.update({
    where: { id },
    data: {
      name: data.name,
      startDate: data.startDate,
      term: data.term,
      note: data.note,
      Debtor: {
        connect: { id: data.debtorId }
      }
    }
  });

  return updated;
}


  async remove(id: string) {
  const existing = await this.prisma.debt.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundException("O'chirmoqchi bo'lgan debt topilmadi");
  }

  await this.prisma.imageOfDebt.deleteMany({
    where: { debtId: id }
  });

  return await this.prisma.debt.delete({
    where: { id }
  });
}

}
