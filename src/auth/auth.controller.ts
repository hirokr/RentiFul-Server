import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AuthService, CreateUserDto, ValidateCredentialsDto } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('validate-credentials')
  validateCredentials(@Body() dto: ValidateCredentialsDto) {
    return this.authService.validateCredentials(dto);
  }

  @Post('create-user')
  createUser(@Body() dto: CreateUserDto) {
    return this.authService.createUser(dto);
  }

  @Get('user/email/:email')
  findUserByEmail(@Param('email') email: string) {
    return this.authService.findUserByEmail(email);
  }

  @Get('user/provider/:provider/:providerId')
  findUserByProvider(
    @Param('provider') provider: string,
    @Param('providerId') providerId: string,
  ) {
    return this.authService.findUserByProvider(provider, providerId);
  }

  @Get('user/:id')
  getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }
}