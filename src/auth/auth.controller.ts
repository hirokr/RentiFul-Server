import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, ValidateCredentialsDto, LinkOAuthAccountDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('validate-credentials')
  @HttpCode(HttpStatus.OK)
  validateCredentials(@Body() dto: ValidateCredentialsDto) {
    return this.authService.validateCredentials(dto);
  }

  @Post('create-user')
  @HttpCode(HttpStatus.CREATED)
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

  @Post('link-oauth-account')
  @HttpCode(HttpStatus.OK)
  linkOAuthAccount(@Body() dto: LinkOAuthAccountDto) {
    return this.authService.linkOAuthAccount(dto.userId, dto.role, {
      provider: dto.provider,
      providerId: dto.providerId,
      image: dto.image,
    });
  }
}