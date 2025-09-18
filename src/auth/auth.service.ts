import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaDbService } from '../prisma-db/prisma-db.service';
import * as bcrypt from 'bcryptjs';
import type { CreateUserDto, ValidateCredentialsDto } from './dto';



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

    // For OAuth providers, check if user exists by provider first
    if (provider && provider !== 'credentials' && providerId) {
      const existingUser = await this.findUserByProvider(provider, providerId);
      if (existingUser) {
        // Update existing OAuth user
        return this.updateOAuthUser(existingUser.id, existingUser.role, {
          email,
          name,
          image,
        });
      }
    }

    // Check if user already exists by email
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      // If it's an OAuth login and user exists with credentials, link the accounts
      if (provider && provider !== 'credentials' && providerId) {
        return this.linkOAuthAccount(existingUser.id, existingUser.role, {
          provider,
          providerId,
          image,
        });
      }
      throw new ConflictException('User with this email already exists');
    }

    // Hash password if provided (for credentials provider)
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
          provider: provider || 'credentials',
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
          provider: provider || 'credentials',
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
      provider: user.provider,
    };
  }

  async updateOAuthUser(userId: string, role: string, updateData: { email: string; name: string; image?: string }) {
    let user;
    if (role === 'tenant') {
      user = await this.prisma.tenant.update({
        where: { id: userId },
        data: {
          email: updateData.email,
          name: updateData.name,
          image: updateData.image,
        },
      });
    } else {
      user = await this.prisma.manager.update({
        where: { id: userId },
        data: {
          email: updateData.email,
          name: updateData.name,
          image: updateData.image,
        },
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role,
      provider: user.provider,
    };
  }

  async linkOAuthAccount(userId: string, role: string, oauthData: { provider: string; providerId: string; image?: string }) {
    let user;
    if (role === 'tenant') {
      user = await this.prisma.tenant.update({
        where: { id: userId },
        data: {
          provider: oauthData.provider,
          providerId: oauthData.providerId,
          image: oauthData.image || undefined,
        },
      });
    } else {
      user = await this.prisma.manager.update({
        where: { id: userId },
        data: {
          provider: oauthData.provider,
          providerId: oauthData.providerId,
          image: oauthData.image || undefined,
        },
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role,
      provider: user.provider,
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
      provider: user.provider,
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
      provider: user.provider,
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
      provider: user.provider,
    };
  }
}