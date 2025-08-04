import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class CreateSmDto {
    @ApiProperty({ example: "this is a sms's text for debtor" })
    @IsString()
    text: string
    @ApiProperty({ example: "12345678" })
    @IsString()
    debtorId: string
}
