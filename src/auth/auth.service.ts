import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaDbService } from '../prisma-db/prisma-db.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaDbService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password, name, phoneNumber, role } = dto;

    // Check if user already exists
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { email },
    });
    const existingManager = await this.prisma.manager.findUnique({
      where: { email },
    });

    if (existingTenant || existingManager) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    let user;
    if (role === 'tenant') {
      user = await this.prisma.tenant.create({
        data: {
          email,
          passwordHash: hashedPassword,
          name,
          phoneNumber,
        },
      });
    } else if (role === 'manager') {
      user = await this.prisma.manager.create({
        data: {
          email,
          passwordHash: hashedPassword,
          name,
          phoneNumber,
        },
      });
    } else {
      throw new UnauthorizedException('Invalid role');
    }

    const payload = { sub: user.id, email: user.email, role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
      },
    };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    // Check tenant first
    let user = await this.prisma.tenant.findUnique({
      where: { email },
    });
    let role = 'tenant';

    // If not found in tenants, check managers
    if (!user) {
      user = await this.prisma.manager.findUnique({
        where: { email },
      });
      role = 'manager';
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
      },
    };
  }

  async validateUser(payload: any) {
    const { sub, role } = payload;
    
    let user;
    if (role === 'tenant') {
      user = await this.prisma.tenant.findUnique({
        where: { id: sub },
      });
    } else if (role === 'manager') {
      user = await this.prisma.manager.findUnique({
        where: { id: sub },
      });
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    return { ...user, role };
  }
}