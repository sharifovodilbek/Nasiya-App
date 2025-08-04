import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto, PayAsYouWishDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { RemainingMonthsDto } from './dto/RemainingMonths.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MultiMonthPayDto } from './dto/MultiMonthlyPaydto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) { }

  async oneMonthPay(dto: CreatePaymentDto, SellerId: string) {
    const debt = await this.prisma.debt.findUnique({
      where: { id: dto.debtId },
    });

    if (!debt) {
      throw new NotFoundException('Borrowed product not found');
    }

    if (debt.total <= 0) {
      throw new BadRequestException(
        'This product is already fully paid. Further payments are not allowed.',
      );
    }

    if (debt.total < debt.monthlyPayment) {
      throw new BadRequestException(
        `Remaining amount is less than a month's payment. Please use "Pay As You Wish" option.`,
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
          'Payment completed. Total amount is now 0 sum. No further payments are allowed.',
      };
    } else {
      await this.prisma.debt.update({
        where: { id: dto.debtId },
        data: { total: newTotal },
      });
      return {
        message: 'One month payment successful',
        remainingAmount: newTotal,
      };
    }
  }

  async payAsYouWish(dto: PayAsYouWishDto, SellerId: string) {
    const debt = await this.prisma.debt.findUnique({
      where: { id: dto.debtId },
      include: {
        ImagesOfDebt: true,
      },
    });

    if (!debt) {
      throw new NotFoundException('Borrowed product not found');
    }

    if (debt.total <= 0) {
      throw new BadRequestException(
        `This product is already fully paid. Total amount is 0 sum.`,
      );
    }

    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    if (dto.amount > debt.total) {
      throw new BadRequestException(
        `You cannot pay more than ${debt.total} sum`,
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
          'Payment completed. The total amount is now 0 sum. Further payments are not allowed.',
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
        message: `Payment successful. ${remainingMonths} months of payment remaining`,
        remainingAmount: newTotal,
      };
    }
  }

  async calculateRemainingMonths(dto: RemainingMonthsDto) {
    const debt = await this.prisma.debt.findUnique({
      where: { id: dto.debtId },
    });

    if (!debt) {
      throw new NotFoundException('Borrowed product not found');
    }

    if (debt.debtorId !== dto.debtorId) {
      throw new BadRequestException(
        'This borrowed product does not belong to the specified debtor',
      );
    }

    if (debt.total <= 0) {
      return {
        message: 'This product is fully paid. No remaining payments.',
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
async multiMonthPay(dto: MultiMonthPayDto, SellerId: string) {
  const debt = await this.prisma.debt.findUnique({
    where: { id: dto.debtId },
  });

  if (!debt) {
    throw new NotFoundException('Borrowed product not found');
  }

  if (debt.debtorId !== dto.debtorId) {
    throw new BadRequestException(
      'This borrowed product does not belong to the specified debtor',
    );
  }

  if (debt.total <= 0) {
    throw new BadRequestException(
      'This product is already fully paid. Further payments are not allowed.',
    );
  }

  const remainingMonths = Math.ceil(
    debt.total / debt.monthlyPayment,
  );

  if (dto.monthsToPay > remainingMonths) {
    throw new BadRequestException(
      `You cannot pay more than ${remainingMonths} months. Only ${remainingMonths} months are left.`,
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
      ? 'Payment completed. Total amount is now 0 sum.'
      : `Payment successful. ${remainingMonthsAfterPayment} months of payment remaining`;

  return {
    message,
    remainingAmount: newTotal,
    remainingMonths: remainingMonthsAfterPayment,
  };
}

}