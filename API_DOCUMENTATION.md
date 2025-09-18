# Real Estate API Documentation

## Authentication

**Note**: This API is designed to work with NextAuth v5. Authentication is handled by NextAuth on the frontend, and the server validates sessions.

### Validate Credentials (for NextAuth credentials provider)
- **POST** `/auth/validate-credentials`
- Body: `{ email, password }`
- Returns user data if credentials are valid, null otherwise

### Create User (for NextAuth account creation)
- **POST** `/auth/create-user`
- Body: `{ email, name, role: 'tenant' | 'manager', password?, phoneNumber?, image?, provider?, providerId? }`

### Get User by Email
- **GET** `/auth/user/email/:email`

### Get User by Provider
- **GET** `/auth/user/provider/:provider/:providerId`

### Get User by ID
- **GET** `/auth/user/:id`

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
PORT=3000
```

## Setup Instructions

1. Install dependencies: `npm install`
2. Set up environment variables
3. Run Prisma migrations: `npx prisma migrate dev`
4. Generate Prisma client: `npx prisma generate`
5. Start the server: `npm run dev`

## NextAuth Integration

This server is designed to work with NextAuth v5 on the frontend. The authentication flow works as follows:

1. **OAuth Flow**: NextAuth handles OAuth providers (Google, GitHub, etc.) and creates/updates users via the `/auth/create-user` endpoint
2. **Credentials Flow**: NextAuth validates credentials via the `/auth/validate-credentials` endpoint
3. **Session Validation**: Protected endpoints expect a base64-encoded user object in the Authorization header
4. **User Management**: The server provides endpoints to find users by email, provider, or ID for NextAuth callbacks

### Frontend Integration Example

```typescript
// In your NextAuth configuration
providers: [
  CredentialsProvider({
    async authorize(credentials) {
      const res = await fetch('http://localhost:3001/auth/validate-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const user = await res.json();
      return user || null;
    },
  }),
  GoogleProvider({
    // OAuth provider config
  }),
],
callbacks: {
  async signIn({ user, account, profile }) {
    if (account?.provider !== 'credentials') {
      // Handle OAuth user creation/update
      await fetch('http://localhost:3001/auth/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          image: user.image,
          provider: account.provider,
          providerId: account.providerAccountId,
          role: 'tenant', // or determine based on your logic
        }),
      });
    }
    return true;
  },
}
```

## Key Features Implemented

- NextAuth v5 integration with OAuth and credentials authentication
- Role-based access control (tenant/manager)
- Property management with location/geocoding (image URLs handled by frontend)
- Application workflow (create, approve/deny)
- Tenant favorites system
- Lease and payment tracking
- Comprehensive filtering for property search
- PostGIS integration for location-based queries