import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateDebtorDto } from './dto/create-debtor.dto';
import { UpdateDebtorDto } from './dto/update-debtor.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { IsPhoneNumber } from 'class-validator';
import { tr } from 'date-fns/locale';

@Injectable()
export class DebtorService {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: CreateDebtorDto, sellerId: string) {
    try {
      const newDebtor = await this.prisma.debtor.create({
        data: {
          fullname: data.fullname,
          address: data.address,
          note: data.note,
          Seller: {
            connect: { id: sellerId }
          },
        },
      });
      if (data.images && data.images.length > 0) {
        for (const image of data.images) {
          await this.prisma.imageOfDebtor.create({
            data: {
              debtorId: newDebtor.id,
              image: image,
              sellerId
            }
          })
        }
      }

      if (data.phoneNumbers && data.phoneNumbers.length > 0) {
        for (const number of data.phoneNumbers) {
          await this.prisma.numberOfDebtor.create({
            data: {
              debtorId: newDebtor.id,
              number: number

            }
          })
        }
      }
      return newDebtor

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
        { name: { contains: filter, mode: 'insensitive' } },
        { phone: { contains: filter, mode: 'insensitive' } },
        { email: { contains: filter, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    }

    const debtor = await this.prisma.debtor.findMany({
      select: {
        id: true,
        fullname: true,
        address: true,
        note: true,
        createdAt: true,
        updatedAt: true,
        ImagesOfDebtor: {
          select: {
            image: true
          }
        },
        NumberOfDebtor: {
          select: {
            number: true
          }
        },
        Debt:{
          select:{
            id:true,
            name:true,
            startDate:true,
            term:true,
            total:true,
            monthlyPayment:true,
          }
        }
      },
      where,
      skip,
      take,
      orderBy: sortBy ? orderBy : { createdAt: 'desc' },



    });

    const total = await this.prisma.debtor.count({ where });

    return {
      data: debtor,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }

  async findOne(id: string) {
    try {
      const debtor = await this.prisma.debtor.findUnique({ where: { id } }
        
      );
      if (!debtor) {
        throw new NotFoundException('Bunday IDga ega qarzdor topilmadi');
      }
      return debtor;
    } catch (error) {
      throw new BadRequestException('Topishda xatolik: ' + error.message);
    }
  }

  async update(id: string, data: UpdateDebtorDto) {
  try {
    const existing = await this.prisma.debtor.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Yangilamoqchi bo\'lgan qarzdor topilmadi');
    }

    const debts = await this.prisma.debt.findMany({
      where: { debtorId: id },
    });

    if (debts.length > 0) {
      throw new BadRequestException('Bu qarzdorning qarzlari mavjudligi sababli o‘chirib bo‘lmaydi');
    }

    if (data.images && data.images.length > 0) {
      await this.prisma.imageOfDebtor.updateMany({
        where: { debtorId: id },
        data: {
          image: data.images[0], 
        }
      });
    }

    if (data.phoneNumbers) {
      await this.prisma.numberOfDebtor.updateMany({
        where: { debtorId: id },
        data: {
          number: data.phoneNumbers[0]
        }
      });
    }

    // Faqat debtor jadvalidagi fieldlarni ajratib olish
    const { images, phoneNumbers, ...debtorFields } = data;

    return await this.prisma.debtor.update({
      where: { id },
      data: debtorFields, // bu yerda faqat kerakli fieldlar bo‘ladi
    });
  } catch (error) {
    throw new BadRequestException('Yangilashda xatolik: ' + error.message);
  }
}

  async remove(id: string) {
    try {
      const existing = await this.prisma.debtor.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException('O\'chirilmoqchi bo\'lgan qarzdor topilmadi');
      }
      const debts = await this.prisma.debt.findMany({
        where: { debtorId: id },
      });

      if (debts.length > 0) {
        throw new BadRequestException('Bu qarzdorning qarzlari mavjudligi sababli o‘chirib bo‘lmaydi');
      }

      await this.prisma.imageOfDebtor.deleteMany({
        where: { debtorId: id }
      })

      await this.prisma.numberOfDebtor.deleteMany({
        where: { debtorId: id }
      })

      return await this.prisma.debtor.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException('O\'chirishda xatolik: ' + error.message);
    }
  }
}
