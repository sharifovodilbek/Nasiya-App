import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

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

    const startDate = new Date(dto.startDate);
    if (isNaN(startDate.getTime())) {
      throw new BadRequestException('Invalid startDate format');
    }

    const monthMatch = dto.term.match(/\d+/);
    if (!monthMatch) {
      throw new BadRequestException('Term must contain a number (e.g., "3 oy")');
    }
    const termMonths = parseInt(monthMatch[0], 10);
    if (termMonths <= 0) {
      throw new BadRequestException('Term must be at least 1 month');
    }

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + termMonths);

    const monthlyPayment = Math.ceil(dto.total / termMonths);

    const debt = await this.prisma.debt.create({
      data: {
        name: dto.name,
        startDate: startDate,
        term: dto.term,
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
      select: {
        id: true,
        name: true,
        term: true,
        total: true,
        startDate: true,
        monthlyPayment: true,
        note: true,
        createdAt:true,
        updatedAt:true,
        Debtor: {
          select: {
            fullname: true,
            address: true,
            note: true
          }
        },
        ImagesOfDebt: {
          select: {
            image: true
          }
        }
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
        paymentHistory: true,
        createdAt: true,
        updatedAt: true,
        Debtor: {
          select: {
            fullname: true,
            address: true,
            note: true
          }
        },
        ImagesOfDebt: {
          select: {
            image: true
          }
        },
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
    select: {
      id: true,
      name: true,
      startDate: true,
      term: true,
      total: true,
      note: true,
      monthlyPayment: true,
      createdAt: true,
      updatedAt: true,
      Debtor: {
        select: {
          fullname: true,
          address: true,
          note: true,
        },
      },
      ImagesOfDebt: {
        select: {
          image: true,
        },
      },
    },
  });

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

    const total = data.total ?? existing.total;
    const term = data.term ?? existing.term;

    const numericTerm = parseInt(term.toString());

    if (isNaN(numericTerm) || numericTerm <= 0) {
      throw new BadRequestException('Term noto‘g‘ri formatda. Masalan: "3 oy" bo‘lishi kerak');
    }

    const monthlyPayment = Math.round(total / numericTerm);

    const updated = await this.prisma.debt.update({
      where: { id },
      data: {
        name: data.name,
        startDate: data.startDate,
        term: term,
        total: total,
        monthlyPayment: monthlyPayment,
        note: data.note,
        Debtor: data.debtorId
          ? { connect: { id: data.debtorId } }
          : undefined
      }
    });

    return updated;
  }

  async remove(id: string) {
    const existing = await this.prisma.debt.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("O'chirmoqchi bo'lgan debt topilmadi");
    }
    await this.prisma.paymentHistory.deleteMany({
      where: { debtId: id },
    });

    await this.prisma.imageOfDebt.deleteMany({
      where: { debtId: id }
    });

    const data = await this.prisma.debt.delete({
      where: { id },
    });

    return {
      message: 'Debt o\'chirildi!',
      data: data
    }
  }
}
