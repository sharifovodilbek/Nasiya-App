import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class CreateDebtDto {
    @ApiProperty()
    @IsString()
    name:string
    @ApiProperty()
    @IsString()
    term:string
    @ApiProperty()
    @IsString()
    note:string
    @ApiProperty()
    @IsString()
    debtorId:string

}
