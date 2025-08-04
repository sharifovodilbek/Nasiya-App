import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { SmsService } from './sms.service';
import { CreateSmDto } from './dto/create-sm.dto';
import { UpdateSmDto } from './dto/update-sm.dto';
import { ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleD } from 'src/seller/decorator';
import { Role } from '@prisma/client';
import { RoleGuard } from 'src/guards/role.guard';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) { }

  @Post()
  create(@Body() data: CreateSmDto) {
    return this.smsService.create(data);
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
    return this.smsService.findAll(filter, page, limit, sortBy, sortOrder);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.smsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSampleDto: UpdateSmDto,
  ) {
    return this.smsService.update(id, updateSampleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.smsService.remove(id);
  }
}
