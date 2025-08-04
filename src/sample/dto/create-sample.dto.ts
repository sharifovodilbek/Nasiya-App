import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateSampleDto {
    @ApiProperty({ example: "This is a sample note" })
    @IsString()
    note: string;
}
