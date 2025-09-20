import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaDbService } from '../prisma-db/prisma-db.service';

@Injectable()
export class ManagerService {
  constructor(private prisma: PrismaDbService) { }

  async getManager(id: string) {
    const manager = await this.prisma.manager.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    const payload = {
      name: manager.user.name,
      id: manager.id,
      email: manager.user.email,
      phoneNumber: manager.phoneNumber,
      image: manager.user.image,
    }
    return payload;
  }

  async updateManager(id: string, updateData: { name?: string; email?: string; phoneNumber?: string }) {
    try {
      const manager = await this.prisma.manager.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!manager) {
        throw new NotFoundException('Manager not found');
      }

      // Update manager-specific fields
      const updatedManager = await this.prisma.manager.update({
        where: { id },
        data: {
          phoneNumber: updateData.phoneNumber || manager.phoneNumber,
        },
        include: { user: true },
      });

      // Update user fields if provided
      if (updateData.name || updateData.email) {
        await this.prisma.user.update({
          where: { id: manager.userId },
          data: {
            name: updateData.name || manager.user.name,
            email: updateData.email || manager.user.email,
          },
        });
      }

      return updatedManager;
    } catch (error) {
      throw new Error(`Error updating manager: ${error.message}`);
    }
  }

  async getManagerProperties(id: string) {
    try {
      const properties = await this.prisma.property.findMany({
        where: { managerId: id },
        include: {
          location: true,
        },
      });

      const propertiesWithFormattedLocation = await Promise.all(
        properties.map(async (property) => {
          const coordinates: { coordinates: string }[] =
            await this.prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

          let longitude = 0;
          let latitude = 0;

          if (coordinates[0]?.coordinates) {
            const coordMatch = coordinates[0].coordinates.match(/POINT\(([^ ]+) ([^ ]+)\)/);
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
        })
      );

      return propertiesWithFormattedLocation;
    } catch (error) {
      throw new Error(`Error retrieving manager properties: ${error.message}`);
    }
  }
}
