import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class CreateDebtorDto {
    @ApiProperty({example:"John Doe"})
    @IsString()
    fullname: string

    @ApiProperty({example:"Tashkent Chilonzor"})
    @IsString()
    address: string

    @ApiProperty({example:"this note is about debtor"})
    @IsString()
    note: string   
}
