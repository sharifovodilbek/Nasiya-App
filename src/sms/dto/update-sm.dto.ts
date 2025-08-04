import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSmDto } from './create-sm.dto';
import { IsString } from 'class-validator';

export class UpdateSmDto extends PartialType(CreateSmDto) {
    @ApiProperty({ example: "this is a sms's text for debtor" })
    @IsString()
    text?: string
    @ApiProperty({ example: "12345678" })
    @IsString()
    debtorId?: string

}
