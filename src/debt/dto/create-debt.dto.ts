import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsDateString, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateDebtDto {
    @ApiProperty({ example: "Test Sinov" })
    @IsString()
    name: string
    @ApiProperty({example:"1000000", type:Number})
    @IsNumber()
    total:number
    @ApiProperty({ example: "2025-08-04T07:28:28.537Z" })
    @IsDateString()
    startDate: Date
    @ApiProperty({ example: "1 oy" })
    @IsString()
    term: string
    @ApiProperty({ example: "Iphone 14 Pro, boshlang'ich to'lovi bor" })
    @IsString()
    note: string
    @ApiProperty({ example: "string" })
    @IsString()
    debtorId: string
    @ApiProperty({
        example: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
        ],
        type: [String],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[]
}