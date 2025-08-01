import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateDebtDto } from './create-debt.dto';
import { IsString } from 'class-validator';

export class UpdateDebtDto extends PartialType(CreateDebtDto) {
    @ApiProperty()
    @IsString()
    name?: string
    @ApiProperty()
    @IsString()
    term?: string
    @ApiProperty()
    @IsString()
    note?: string
    @ApiProperty()
    @IsString()
    debtorId?: string
}
