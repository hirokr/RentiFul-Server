import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Get user from NextAuth session (passed from frontend)
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No session token provided');
    }

    // Extract session data from the token
    // In a real implementation, you would validate the NextAuth session token
    // For now, we'll expect the frontend to pass user data in a specific format
    try {
      const sessionData = authHeader.replace('Bearer ', '');
      const userData = JSON.parse(Buffer.from(sessionData, 'base64').toString());

      if (!userData.id || !userData.email || !userData.role) {
        throw new UnauthorizedException('Invalid session data');
      }

      // Attach user to request
      request.user = userData;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid session token');
    }
  }
}

// Keep the old name for backward compatibility
export const JwtAuthGuard = SessionAuthGuard;