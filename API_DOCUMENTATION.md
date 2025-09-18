# Real Estate API Documentation

## Authentication

### Register
- **POST** `/auth/register`
- Body: `{ email, password, name, phoneNumber, role: 'tenant' | 'manager' }`

### Login
- **POST** `/auth/login`
- Body: `{ email, password }`

## Properties

### Get Properties (with filters)
- **GET** `/properties`
- Query params: `priceMin`, `priceMax`, `beds`, `baths`, `propertyType`, `squareFeetMin`, `squareFeetMax`, `amenities`, `availableFrom`, `latitude`, `longitude`, `favoriteIds`

### Get Property by ID
- **GET** `/properties/:id`

### Create Property (Manager only)
- **POST** `/properties`
- Headers: `Authorization: Bearer <token>`
- Body: JSON with property details including image URLs
- Required fields: `name`, `description`, `pricePerMonth`, `securityDeposit`, `applicationFee`, `beds`, `baths`, `squareFeet`, `propertyType`, `address`, `city`, `state`, `country`, `postalCode`
- Optional fields: `photoUrls` (array of image URLs), `amenities`, `highlights`, `isPetsAllowed`, `isParkingIncluded`

## Tenants

### Get Current Tenant
- **GET** `/tenants/me`
- Headers: `Authorization: Bearer <token>`

### Update Current Tenant
- **PUT** `/tenants/me`
- Headers: `Authorization: Bearer <token>`
- Body: `{ name?, email?, phoneNumber? }`

### Get Current Residences
- **GET** `/tenants/me/residences`
- Headers: `Authorization: Bearer <token>`

### Add Favorite Property
- **POST** `/tenants/me/favorites/:propertyId`
- Headers: `Authorization: Bearer <token>`

### Remove Favorite Property
- **DELETE** `/tenants/me/favorites/:propertyId`
- Headers: `Authorization: Bearer <token>`

## Managers

### Get Current Manager
- **GET** `/managers/me`
- Headers: `Authorization: Bearer <token>`

### Update Current Manager
- **PUT** `/managers/me`
- Headers: `Authorization: Bearer <token>`
- Body: `{ name?, email?, phoneNumber? }`

### Get Manager Properties
- **GET** `/managers/me/properties`
- Headers: `Authorization: Bearer <token>`

## Applications

### Create Application (Tenant only)
- **POST** `/applications`
- Headers: `Authorization: Bearer <token>`
- Body: `{ applicationDate, status, propertyId, name, phoneNumber, message? }`

### Update Application Status (Manager only)
- **PUT** `/applications/:id/status`
- Headers: `Authorization: Bearer <token>`
- Body: `{ status: 'Pending' | 'Denied' | 'Approved' }`

### List Applications
- **GET** `/applications`
- Headers: `Authorization: Bearer <token>`
- Returns applications based on user role (tenant sees their applications, manager sees applications for their properties)

## Leases

### Get Leases
- **GET** `/leases`
- Headers: `Authorization: Bearer <token>`

### Get Lease Payments
- **GET** `/leases/:id/payments`
- Headers: `Authorization: Bearer <token>`

## Environment Variables

Create a `.env` file with:

```
DATABASE_URL="your-postgresql-connection-string"
SHADOW_DATABASE_URL="your-shadow-database-url"
JWT_SECRET="your-jwt-secret"
PORT=3000
```

## Setup Instructions

1. Install dependencies: `npm install`
2. Set up environment variables
3. Run Prisma migrations: `npx prisma migrate dev`
4. Generate Prisma client: `npx prisma generate`
5. Start the server: `npm run dev`

## Key Features Implemented

- JWT Authentication with role-based access control
- Property management with location/geocoding (image URLs handled by frontend)
- Application workflow (create, approve/deny)
- Tenant favorites system
- Lease and payment tracking
- Comprehensive filtering for property search
- PostGIS integration for location-based queries