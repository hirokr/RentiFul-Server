import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaDbService } from '../prisma-db/prisma-db.service';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaDbService) {}

  async getTenant(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        favorites: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    const paylod = {
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
      favorites: tenant.favorites,
    };
    return paylod;
  }

  async updateTenant(
    id: string,
    updateData: { name?: string; email?: string; phoneNumber?: string },
  ) {
    try {
      const updatedTenant = await this.prisma.tenant.update({
        where: { id },
        data: updateData,
      });

      return updatedTenant;
    } catch (error) {
      throw new Error(`Error updating tenant: ${error.message}`);
    }
  }

  async getCurrentResidences(id: string) {
    try {
      const properties = await this.prisma.property.findMany({
        where: { tenants: { some: { id } } },
        include: {
          location: true,
        },
      });

      const residencesWithFormattedLocation = await Promise.all(
        properties.map(async (property) => {
          const coordinates: { coordinates: string }[] = await this.prisma
            .$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

          let longitude = 0;
          let latitude = 0;

          if (coordinates[0]?.coordinates) {
            const coordMatch = coordinates[0].coordinates.match(
              /POINT\(([^ ]+) ([^ ]+)\)/,
            );
            if (coordMatch) {
              longitude = parseFloat(coordMatch[1]);
              latitude = parseFloat(coordMatch[2]);
            }
          }

          return {
            ...property,
            location: {
              ...property.location,
              coordinates: {
                longitude,
                latitude,
              },
            },
          };
        }),
      );

      return residencesWithFormattedLocation;
    } catch (error) {
      throw new Error(`Error retrieving tenant residences: ${error.message}`);
    }
  }

  async addFavoriteProperty(tenantId: string, propertyId: string) {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        include: { favorites: true },
      });

      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      const existingFavorites = tenant.favorites || [];

      if (existingFavorites.some((fav) => fav.id === propertyId)) {
        throw new ConflictException('Property already added as favorite');
      }

      const updatedTenant = await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          favorites: {
            connect: { id: propertyId },
          },
        },
        include: { favorites: true },
      });

      return updatedTenant;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Error adding favorite property: ${error.message}`);
    }
  }

  async removeFavoriteProperty(tenantId: string, propertyId: string) {
    try {
      const updatedTenant = await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          favorites: {
            disconnect: { id: propertyId },
          },
        },
        include: { favorites: true },
      });

      return updatedTenant;
    } catch (error) {
      throw new Error(`Error removing favorite property: ${error.message}`);
    }
  }
}
