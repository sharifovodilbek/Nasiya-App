import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth (Admin)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() dto: CreateAuthDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginAuthDto) {
    return this.authService.login(dto);
  }

  @Get('admins')
  getAllAdmins(@Query() query: {
    search?: string;
    sortBy?: 'name' | 'email' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    return this.authService.getAllAdmins(query);
  }


  @Get(':id')
  getAdmin(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.authService.getAdminById(id);
  }

  @Patch(':id')
  updateAdmin(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAuthDto,
  ) {
    return this.authService.updateAdmin(id, dto);
  }

  @Delete(':id')
  deleteAdmin(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.authService.deleteAdmin(id);
  }
}
