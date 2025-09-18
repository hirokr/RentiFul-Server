import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaDbService } from '../prisma-db/prisma-db.service';
import { CreateApplicationDto, UpdateApplicationDto } from './dto';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaDbService) {}

  async listApplications(userId: string, userRole: string) {
    try {
      let whereClause = {};

      if (userRole === 'tenant') {
        whereClause = { tenantId: userId };
      } else if (userRole === 'manager') {
        whereClause = {
          property: {
            managerId: userId,
          },
        };
      }

      const applications = await this.prisma.application.findMany({
        where: whereClause,
        include: {
          property: {
            include: {
              location: true,
              manager: true,
            },
          },
          tenant: true,
          lease: true,
        },
      });

      function calculateNextPaymentDate(startDate: Date): Date {
        const today = new Date();
        const nextPaymentDate = new Date(startDate);
        while (nextPaymentDate <= today) {
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        }
        return nextPaymentDate;
      }

      const formattedApplications = applications.map((app) => ({
        ...app,
        property: {
          ...app.property,
          address: app.property.location.address,
        },
        manager: app.property.manager,
        lease: app.lease
          ? {
              ...app.lease,
              nextPaymentDate: calculateNextPaymentDate(app.lease.startDate),
            }
          : null,
      }));

      return formattedApplications;
    } catch (error) {
      throw new Error(`Error retrieving applications: ${error.message}`);
    }
  }

  async createApplication(dto: CreateApplicationDto, tenantId: string) {
    try {
      const property = await this.prisma.property.findUnique({
        where: { id: dto.propertyId },
        select: { pricePerMonth: true, securityDeposit: true },
      });

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      const newApplication = await this.prisma.$transaction(async (prisma) => {
        // Create lease first
        const lease = await prisma.lease.create({
          data: {
            startDate: new Date(),
            endDate: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ),
            rent: property.pricePerMonth,
            deposit: property.securityDeposit,
            propertyId: dto.propertyId,
            tenantId: tenantId,
          },
        });

        // Then create application with lease connection
        const application = await prisma.application.create({
          data: {
            applicationDate: new Date(dto.applicationDate),
            status: dto.status,
            name: dto.name,
            phoneNumber: dto.phoneNumber,
            message: dto.message,
            email: dto.email,
            propertyId: dto.propertyId,
            tenantId: tenantId,
            leaseId: lease.id,
          },
          include: {
            property: true,
            tenant: true,
            lease: true,
          },
        });

        return application;
      });

      return newApplication;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error creating application: ${error.message}`);
    }
  }

  async updateApplicationStatus(id: string, dto: UpdateApplicationDto) {
    try {
      const application = await this.prisma.application.findUnique({
        where: { id },
        include: {
          property: true,
          tenant: true,
        },
      });

      if (!application) {
        throw new NotFoundException('Application not found');
      }

      if (dto.status === 'Approved') {
        const newLease = await this.prisma.lease.create({
          data: {
            startDate: new Date(),
            endDate: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ),
            rent: application.property.pricePerMonth,
            deposit: application.property.securityDeposit,
            propertyId: application.propertyId,
            tenantId: application.tenantId,
          },
        });

        // Update the property to connect the tenant
        await this.prisma.property.update({
          where: { id: application.propertyId },
          data: {
            tenants: {
              connect: { id: application.tenantId },
            },
          },
        });

        // Update the application with the new lease ID
        await this.prisma.application.update({
          where: { id },
          data: { status: dto.status, leaseId: newLease.id },
        });
      } else {
        // Update the application status (for both "Denied" and other statuses)
        await this.prisma.application.update({
          where: { id },
          data: { status: dto.status },
        });
      }

      // Return the updated application
      const updatedApplication = await this.prisma.application.findUnique({
        where: { id },
        include: {
          property: true,
          tenant: true,
          lease: true,
        },
      });

      return updatedApplication;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error updating application status: ${error.message}`);
    }
  }
}
