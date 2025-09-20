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
  ) { }

  async register(dto: RegisterDto) {
    const { email, password, name, phoneNumber, role, imageUrl } = dto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with transaction to ensure consistency
    const result = await this.prisma.$transaction(async (tx) => {
      // Create the user
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          name,
          phoneNumber,
          role,
          image: imageUrl,
        },
      });

      // Create the role-specific record
      if (role === 'TENANT') {
        await tx.tenant.create({
          data: {
            userId: user.id,
            phoneNumber,
          },
        });
      } else if (role === 'MANAGER') {
        await tx.manager.create({
          data: {
            userId: user.id,
            phoneNumber,
          },
        });
      }

      return user;
    });

    const payload = { sub: result.id, email: result.email, role: result.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        image: result.image,
      },
    };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    };
  }

  async validateUser(payload: any) {
    const { sub } = payload;

    const user = await this.prisma.user.findUnique({
      where: { id: sub },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  // Method for NextAuth.js integration
  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Method for OAuth user creation/update
  async createOrUpdateOAuthUser(userData: {
    email: string;
    name?: string;
    image?: string;
    role?: 'TENANT' | 'MANAGER';
  }) {
    const { email, name, image, role = 'TENANT' } = userData;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user
      return this.prisma.user.update({
        where: { email },
        data: {
          name: name || existingUser.name,
          image: image || existingUser.image,
        },
      });
    }

    // Create new user with transaction
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          image,
          role,
        },
      });

      // Create role-specific record
      if (role === 'TENANT') {
        await tx.tenant.create({
          data: {
            userId: user.id,
            phoneNumber: '', // Will need to be updated later
          },
        });
      } else if (role === 'MANAGER') {
        await tx.manager.create({
          data: {
            userId: user.id,
            phoneNumber: '', // Will need to be updated later
          },
        });
      }

      return user;
    });
  }
}