import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginSellerDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    name: string

    @ApiProperty({ example: '123456' })
    @IsString()
    password: string;
}
