import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaDbService } from '../prisma-db/prisma-db.service';
import * as bcrypt from 'bcryptjs';

export interface CreateUserDto {
  email: string;
  name: string;
  role: 'tenant' | 'manager';
  password?: string;
  phoneNumber?: string;
  image?: string;
  provider?: string;
  providerId?: string;
}

export interface ValidateCredentialsDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaDbService) { }

  async validateCredentials(dto: ValidateCredentialsDto) {
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

    if (!user || !user.passwordHash) {
      return null;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role,
    };
  }

  async createUser(dto: CreateUserDto) {
    const { email, name, role, password, phoneNumber, image, provider, providerId } = dto;

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

    // Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 12) : null;

    let user;
    if (role === 'tenant') {
      user = await this.prisma.tenant.create({
        data: {
          email,
          name,
          passwordHash: hashedPassword,
          phoneNumber,
          image,
          provider,
          providerId,
        },
      });
    } else if (role === 'manager') {
      user = await this.prisma.manager.create({
        data: {
          email,
          name,
          passwordHash: hashedPassword,
          phoneNumber,
          image,
          provider,
          providerId,
        },
      });
    } else {
      throw new UnauthorizedException('Invalid role');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role,
    };
  }

  async findUserByEmail(email: string) {
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
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role,
    };
  }

  async findUserByProvider(provider: string, providerId: string) {
    // Check tenant first
    let user = await this.prisma.tenant.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
    });
    let role = 'tenant';

    // If not found in tenants, check managers
    if (!user) {
      user = await this.prisma.manager.findUnique({
        where: {
          provider_providerId: {
            provider,
            providerId,
          },
        },
      });
      role = 'manager';
    }

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role,
    };
  }

  async getUserById(id: string) {
    // Check tenant first
    let user = await this.prisma.tenant.findUnique({
      where: { id },
    });
    let role = 'tenant';

    // If not found in tenants, check managers
    if (!user) {
      user = await this.prisma.manager.findUnique({
        where: { id },
      });
      role = 'manager';
    }

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role,
    };
  }
}