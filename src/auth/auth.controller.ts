import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('manual_register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Endpoint for NextAuth.js credentials validation
  @Post('validate-credentials')
  async validateCredentials(@Body() dto: LoginDto) {
    try {
      const result = await this.authService.login(dto);
      return result.user; // Return user data for NextAuth
    } catch (error) {
      return null; // NextAuth expects null for invalid credentials
    }
  }

  // Endpoint for NextAuth.js to find user by email
  @Get('user')
  async getUserByEmail(@Query('email') email: string) {
    if (!email) {
      return null;
    }
    return this.authService.findUserByEmail(email);
  }

  // Endpoint for OAuth user creation/update
  @Post('oauth-user')
  async createOrUpdateOAuthUser(@Body() userData: {
    email: string;
    name?: string;
    image?: string;
    role?: 'TENANT' | 'MANAGER';
  }) {
    return this.authService.createOrUpdateOAuthUser(userData);
  }
}