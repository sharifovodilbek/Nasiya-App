import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { DebtorService } from './debtor.service';
import { CreateDebtorDto } from './dto/create-debtor.dto';
import { UpdateDebtorDto } from './dto/update-debtor.dto';
import { ApiQuery } from '@nestjs/swagger';
import { RoleD } from 'src/seller/decorator';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

@Controller('debtor')
export class DebtorController {
  constructor(private readonly debtorService: DebtorService) { }

  @RoleD(Role.SELLER)
  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  create(
    @Body() data: CreateDebtorDto,
    @Req() req: Request
  ) {
    const sellerId = (req as any).user.id;
    return this.debtorService.create(data, sellerId);
  }

  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'filter', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @Get()
  findAll(
    @Query('filter') filter: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    return this.debtorService.findAll(filter, page, limit, sortBy, sortOrder);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.debtorService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDebtorDto: UpdateDebtorDto) {
    return this.debtorService.update(id, updateDebtorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.debtorService.remove(id);
  }
}
