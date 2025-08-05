import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto, PayAsYouWishDto } from './dto/create-payment.dto';
import { RemainingMonthsDto } from './dto/RemainingMonths.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MultiMonthPayDto } from './dto/MultiMonthlyPaydto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) { }

  async forOneMonth(dto: CreatePaymentDto, SellerId: string) {
    const debt = await this.prisma.debt.findUnique({
      where: { id: dto.debtId },
    });

    if (!debt) {
      throw new NotFoundException('Debt topilmadi');
    }

    if (debt.total <= 0) {
      throw new BadRequestException(
        'To\'lov yakunlangan!',
      );
    }

    if (debt.total < debt.monthlyPayment) {
      throw new BadRequestException(
        `O'rtacha oylik to'lovidan kamroq qarzingiz bor,Iltimos availableMonths bo'limidan mavjud qarzingizni tekshirib qaytadan to'lov qiling!`,
      );
    }

    await this.prisma.paymentHistory.create({
      data: {
        debtId: dto.debtId,
        debtorId: dto.debtorId,
        amount: debt.monthlyPayment,
      },
    });

    const newTotal = debt.total - debt.monthlyPayment;

    await this.prisma.seller.update({
      where: { id: SellerId },
      data: {
        wallet: {
          increment: debt.monthlyPayment,
        },
      },
    });

    if (newTotal <= 0) {
      await this.prisma.debt.update({
        where: { id: dto.debtId },
        data: { total: 0 },
      });

      return {
        message:
          'Debt has already been paid!',
      };
    } else {
      await this.prisma.debt.update({
        where: { id: dto.debtId },
        data: { total: newTotal },
      });
      return {
        message: '1 oyga muvaffaqiyatli tolov qildingiz',
        remainingAmount: newTotal,
      };
    }
  }

  async inAnyAmount(dto: PayAsYouWishDto, SellerId: string) {
    const debt = await this.prisma.debt.findUnique({
      where: { id: dto.debtId },
      include: {
        ImagesOfDebt: true,
      },
    });

    if (!debt) {
      throw new NotFoundException('Debt not found');
    }

    if (debt.total <= 0) {
      throw new BadRequestException(
        `Bu Debt to'lab bo'lingan!`,
      );
    }

    if (dto.amount <= 0) {
      throw new BadRequestException('Musbat miqdorda pul kiriting');
    }

    if (dto.amount > debt.total) {
      throw new BadRequestException(
        `Siz to'lashingiz kerak bo'lgan miqdor: ${debt.total} so'm`,
      );
    }

    await this.prisma.paymentHistory.create({
      data: {
        debtId: dto.debtId,
        debtorId: dto.debtorId,
        amount: dto.amount,
      },
    });

    await this.prisma.seller.update({
      where: { id: SellerId },
      data: {
        wallet: {
          increment: dto.amount,
        },
      },
    });

    const newTotal = debt.total - dto.amount;

    if (newTotal <= 0) {
      await this.prisma.debt.update({
        where: { id: dto.debtId },
        data: { total: 0 },
      });

      return {
        message:
          'Debt has already been paid!',
      };
    } else {
      await this.prisma.debt.update({
        where: { id: dto.debtId },
        data: { total: newTotal },
      });

      const remainingMonths = Math.ceil(
        newTotal / debt.monthlyPayment,
      );

      return {
        message: `To'lov qabul qilindi.Yana ${remainingMonths} oylik to'lov oylari mavjud!`,
        remainingAmount: newTotal,
      };
    }
  }

  async calculateRemainingMonths(dto: RemainingMonthsDto) {
    const debt = await this.prisma.debt.findUnique({
      where: { id: dto.debtId },
    });

    if (!debt) {
      throw new NotFoundException('Debt not found!');
    }

    if (debt.debtorId !== dto.debtorId) {
      throw new BadRequestException(
        'Bu Debt va Debtor bir biriga mos emas!',
      );
    }

    if (debt.total <= 0) {
      return {
        message: 'Debt has already been paid!',
        remainingMonths: 0,
        remainingAmount: 0,
      };
    }

    const remainingMonths = Math.ceil(
      debt.total / debt.monthlyPayment,
    );

    return {
      debtId: dto.debtId,
      debtorId: dto.debtorId,
      total: debt.total,
      monthlyPayment: debt.monthlyPayment,
      remainingMonths,
    };
  }
  
  async forFewMonths(dto: MultiMonthPayDto, SellerId: string) {
    const debt = await this.prisma.debt.findUnique({
      where: { id: dto.debtId },
    });

    if (!debt) {
      throw new NotFoundException('Borrowed product not found');
    }

    if (debt.debtorId !== dto.debtorId) {
      throw new BadRequestException(
        'Bu Debt va Debtor bir biriga mos emas!',
      );
    }

    if (debt.total <= 0) {
      throw new BadRequestException(
        'Bu to\'lov yakunlangan.',
      );
    }

    const remainingMonths = Math.ceil(
      debt.total / debt.monthlyPayment,
    );

    if (dto.monthsToPay > remainingMonths) {
      throw new BadRequestException(
        ` Xatolik! Siz faqat ${remainingMonths} oy to'lov qilishingiz kerak `,
      );
    }

    const totalPayment = dto.monthsToPay * debt.monthlyPayment;

    await this.prisma.paymentHistory.create({
      data: {
        debtId: dto.debtId,
        debtorId: dto.debtorId,
        amount: totalPayment,
      },
    });

    await this.prisma.seller.update({
      where: { id: SellerId },
      data: {
        wallet: {
          increment: totalPayment,
        },
      },
    });

    const newTotal = debt.total - totalPayment;

    await this.prisma.debt.update({
      where: { id: dto.debtId },
      data: { total: newTotal },
    });

    const remainingMonthsAfterPayment = Math.ceil(
      newTotal / debt.monthlyPayment,
    );

    const message =
      newTotal <= 0
        ? 'To\'lov yakunlandi!'
        : `Yana ${remainingMonthsAfterPayment} oylik to'lov oylari mavjud!`;

    return {
      message,
      remainingAmount: newTotal,
      remainingMonths: remainingMonthsAfterPayment,
    };
  }

}