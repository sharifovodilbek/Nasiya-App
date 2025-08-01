import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateDebtorDto } from './dto/create-debtor.dto';
import { UpdateDebtorDto } from './dto/update-debtor.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DebtorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDebtorDto) {
    try {
      return await this.prisma.debtor.create({
         data,
         include:{
          ImagesOfDebtor:true,
          NumberOfDebtor:true
         }
        });
    } catch (error) {
      throw new BadRequestException('Yaratishda xatolik: ' + error.message);
    }
  }

 async findAll(filter: string, page: number, limit: number) {
  const where: Prisma.DebtorWhereInput | undefined = filter
    ? {
        OR: [
          { fullname: { contains: filter, mode: 'insensitive' } },
          { address: { contains: filter, mode: 'insensitive' } },
        ],
      }
    : undefined;

  const skip = (page - 1) * limit;

  const debtors = await this.prisma.debtor.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return debtors;
}





  async findOne(id: string) {
    try {
      const debtor = await this.prisma.debtor.findUnique({ where: { id } });
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
        throw new NotFoundException('Yangilamoqchi bo‘lgan qarzdor topilmadi');
      }
      return await this.prisma.debtor.update({ where: { id }, data });
    } catch (error) {
      throw new BadRequestException('Yangilashda xatolik: ' + error.message);
    }
  }

  async remove(id: string) {
    try {
      const existing = await this.prisma.debtor.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException('O‘chirilmoqchi bo‘lgan qarzdor topilmadi');
      }
      return await this.prisma.debtor.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException('O‘chirishda xatolik: ' + error.message);
    }
  }
}
