import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateDebtorDto } from './create-debtor.dto';
import { IsString } from 'class-validator';

export class UpdateDebtorDto extends PartialType(CreateDebtorDto) {
    @ApiProperty()
    @IsString()
    fullname?: string

    @ApiProperty()
    @IsString()
    address?: string

    @ApiProperty()
    @IsString()
    note?: string

    @ApiProperty()
    @IsString()
    sellerId?: string
}
