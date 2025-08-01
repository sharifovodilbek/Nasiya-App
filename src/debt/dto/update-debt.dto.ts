import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateDebtDto } from './create-debt.dto';
import { IsString } from 'class-validator';

export class UpdateDebtDto extends PartialType(CreateDebtDto) {
    @ApiProperty({example:"Test Sinov"})
    @IsString()
    name?:string
    @ApiProperty({example:"10.10.2024"})
    @IsString()
    startDate:string
    @ApiProperty({example:"1 oy"})
    @IsString()
    term?:string
    @ApiProperty({example:"Iphone 14 Pro, boshlang'ich to'lovi bor"})
    @IsString()
    note?:string
    @ApiProperty({example:"string"})
    @IsString()
    debtorId?:string
}
