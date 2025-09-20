import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaDbService } from '../prisma-db/prisma-db.service';
import { CreatePropertyDto, QueryPropertyDto } from './dto';
import { Prisma } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class PropertyService {
  constructor(
    private prisma: PrismaDbService,
  ) { }

  async getProperties(query: QueryPropertyDto) {
    try {
      const {
        favoriteIds,
        priceMin,
        priceMax,
        beds,
        baths,
        propertyType,
        squareFeetMin,
        squareFeetMax,
        amenities,
        availableFrom,
        latitude,
        longitude,
      } = query;

      let whereConditions: Prisma.Sql[] = [];

      if (favoriteIds) {
        const favoriteIdsArray = favoriteIds.split(',');
        whereConditions.push(
          Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray, ',')})`,
        );
      }

      if (priceMin) {
        whereConditions.push(Prisma.sql`p."pricePerMonth" >= ${priceMin}`);
      }

      if (priceMax) {
        whereConditions.push(Prisma.sql`p."pricePerMonth" <= ${priceMax}`);
      }

      if (beds && beds !== 0) {
        whereConditions.push(Prisma.sql`p.beds >= ${beds}`);
      }

      if (baths && baths !== 0) {
        whereConditions.push(Prisma.sql`p.baths >= ${baths}`);
      }

      if (squareFeetMin) {
        whereConditions.push(Prisma.sql`p."squareFeet" >= ${squareFeetMin}`);
      }

      if (squareFeetMax) {
        whereConditions.push(Prisma.sql`p."squareFeet" <= ${squareFeetMax}`);
      }

      if (propertyType && propertyType !== 'any') {
        whereConditions.push(
          Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`,
        );
      }

      if (amenities && amenities !== 'any') {
        const amenitiesArray = amenities.split(',');
        whereConditions.push(
          Prisma.sql`p.amenities @> ${amenitiesArray}::"Amenity"[]`,
        );
      }

      if (availableFrom && availableFrom !== 'any') {
        const date = new Date(availableFrom);
        if (!isNaN(date.getTime())) {
          whereConditions.push(
            Prisma.sql`EXISTS (
              SELECT 1 FROM "Lease" l 
              WHERE l."propertyId" = p.id 
              AND l."startDate" >= ${date.toISOString()}::timestamp
            )`,
          );
        }
      }

      if (latitude && longitude) {
        const radiusInKilometers = 1000;
        const degrees = radiusInKilometers / 111;

        whereConditions.push(
          Prisma.sql`ST_DWithin(
            l.coordinates::geometry,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
            ${degrees}
          )`,
        );
      }

      const completeQuery = Prisma.sql`
        SELECT 
          p.*,
          json_build_object(
            'id', l.id,
            'address', l.address,
            'city', l.city,
            'state', l.state,
            'country', l.country,
            'postalCode', l."postalCode",
            'coordinates', json_build_object(
              'longitude', ST_X(l."coordinates"::geometry),
              'latitude', ST_Y(l."coordinates"::geometry)
            )
          ) as location,
          p.amenities,
          (
            SELECT MIN(le."startDate") 
            FROM "Lease" le 
            WHERE le."propertyId" = p.id
          ) as availableFrom
        FROM "Property" p
        JOIN "Location" l ON p."locationId" = l.id
        ${whereConditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
          : Prisma.empty
        }
      `;

      const properties = await this.prisma.$queryRaw(completeQuery);
      return properties;
    } catch (error) {
      throw new Error(`Error retrieving properties: ${error.message}`);
    }
  }

  async getProperty(id: string) {
    try {
      const property = await this.prisma.property.findUnique({
        where: { id },
        include: {
          location: true,
          manager: true,
        },
      });

      console.log(id);

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      // Get coordinates
      const coordinates: { coordinates: string }[] = await this.prisma
        .$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

      let longitude = 0;
      let latitude = 0;

      if (coordinates[0]?.coordinates) {
        // Parse WKT format: POINT(longitude latitude)
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
    } catch (error) {
      throw new Error(`Error retrieving property: ${error.message}`);
    }
  }

  async createProperty(
    dto: CreatePropertyDto,
    managerId: string,
  ) {
    try {
      const {
        address,
        city,
        state,
        country,
        postalCode,
        amenities,
        highlights,
        ...propertyData
      } = dto;

      const parsedAmenities = Array.isArray(amenities)
        ? amenities
        : amenities
          ? JSON.parse(amenities)
          : [];

      const parsedHighlights = Array.isArray(highlights)
        ? highlights
        : highlights
          ? JSON.parse(highlights)
          : [];

      // Photo URLs are now provided by the frontend
      const photoUrls = dto.photoUrls || [];

      // Geocode address
      const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
        {
          street: address,
          city,
          country,
          postalcode: postalCode,
          format: 'json',
          limit: '1',
        },
      ).toString()}`;

      const geocodingResponse = await axios.get(geocodingUrl, {
        headers: {
          'User-Agent': 'RealEstateApp (contact@example.com)',
        },
      });

      const [longitude, latitude] =
        geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
          ? [
            parseFloat(geocodingResponse.data[0]?.lon),
            parseFloat(geocodingResponse.data[0]?.lat),
          ]
          : [0, 0];

      // Create location
      const location = await this.prisma.$queryRaw<any[]>`
        INSERT INTO "Location" (id, address, city, state, country, "postalCode", coordinates)
        VALUES (gen_random_uuid(), ${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
        RETURNING id, address, city, state, country, "postalCode";
      `;

      // Create property
      const newProperty = await this.prisma.property.create({
        data: {
          ...propertyData,
          photoUrls,
          locationId: location[0].id,
          managerId,
          amenities: parsedAmenities,
          highlights: parsedHighlights,
        },
        include: {
          location: true,
          manager: true,
        },
      });

      return newProperty;
    } catch (error) {
      throw new Error(`Error creating property: ${error.message}`);
    }
  }
}
