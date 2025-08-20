import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNumber, IsPhoneNumber, IsString, IsOptional } from 'class-validator';

export class UpdateSellerDto {
  @ApiProperty({ example: "John Doe" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: "+998912345678" })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ example: "12345" })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ example: 1234 })
  @IsOptional()
  @IsNumber()
  passcode?: number;

  @ApiProperty({ example: "alex@gmail.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 15000000 })
  @IsOptional()
  @IsNumber()
  wallet?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  img?: string

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  status?: boolean
}
