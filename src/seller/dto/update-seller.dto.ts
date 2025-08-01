import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsPhoneNumber, IsString } from 'class-validator';

export class UpdateSellerDto  {
    @ApiProperty({ example: "John Doe" })
    @IsString()
    name?: string;

    @ApiProperty({ example: "+998912345678" })
    @IsPhoneNumber()
    phone?: string;

    @ApiProperty({ example: '12345' })
    @IsString()
    password?: string;

    @ApiProperty({ example: 'john@gmail.com' })
    @IsString()
    email?:string

}
