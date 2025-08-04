import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSampleDto } from './create-sample.dto';
import { IsString } from 'class-validator';

export class UpdateSampleDto extends PartialType(CreateSampleDto) {
    @ApiProperty({ example: "This is a sample note" })
    @IsString()
    note?: string;
}
