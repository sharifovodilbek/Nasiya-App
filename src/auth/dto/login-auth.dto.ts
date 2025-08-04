import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginAuthDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    name: string

    @ApiProperty({ example: '12345' })
    @IsString()
    password: string;
}
