# Real Estate API Documentation

## Authentication

**Note**: This API is designed to work with NextAuth v5. Authentication is handled by NextAuth on the frontend, and the server validates sessions.

### Validate Credentials (for NextAuth credentials provider)
- **POST** `/auth/validate-credentials`
- Body: `{ email, password }`
- Returns user data if credentials are valid, null otherwise

### Create User (for NextAuth account creation)
- **POST** `/auth/create-user`
- Body: `{ email, name, role: 'tenant' | 'manager', password?, phoneNumber?, image?, provider?: 'google' | 'github' | 'facebook' | 'credentials', providerId? }`

### Get User by Email
- **GET** `/auth/user/email/:email`

### Get User by Provider
- **GET** `/auth/user/provider/:provider/:providerId`

### Get User by ID
- **GET** `/auth/user/:id`

### Link OAuth Account
- **POST** `/auth/link-oauth-account`
- Body: `{ userId, role, provider: 'google' | 'github' | 'facebook', providerId, image? }`

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

This server is designed to work with NextAuth v5 on the frontend and supports the following OAuth providers:

- **Google OAuth 2.0**
- **GitHub OAuth**
- **Facebook Login**
- **Credentials (email/password)**

The authentication flow works as follows:

1. **OAuth Flow**: NextAuth handles OAuth providers (Google, GitHub, etc.) and creates/updates users via the `/auth/create-user` endpoint
2. **Credentials Flow**: NextAuth validates credentials via the `/auth/validate-credentials` endpoint
3. **Session Validation**: Protected endpoints expect a base64-encoded user object in the Authorization header
4. **User Management**: The server provides endpoints to find users by email, provider, or ID for NextAuth callbacks

### Frontend Integration Example

```typescript
// In your NextAuth configuration
import { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Facebook from "next-auth/providers/facebook"
import Credentials from "next-auth/providers/credentials"

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const res = await fetch('http://localhost:3001/auth/validate-credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        
        if (!res.ok) return null;
        const user = await res.json();
        return user || null;
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'credentials') {
        try {
          // Check if user exists by provider
          const existingUser = await fetch(
            `http://localhost:3001/auth/user/provider/${account.provider}/${account.providerAccountId}`
          );
          
          if (existingUser.ok) {
            // User exists, update their info
            const userData = await existingUser.json();
            await fetch('http://localhost:3001/auth/create-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                image: user.image,
                provider: account.provider,
                providerId: account.providerAccountId,
                role: userData.role,
              }),
            });
          } else {
            // New OAuth user - create with default role
            await fetch('http://localhost:3001/auth/create-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                image: user.image,
                provider: account.provider,
                providerId: account.providerAccountId,
                role: 'tenant', // Default role for OAuth users
              }),
            });
          }
        } catch (error) {
          console.error('Error handling OAuth sign in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.provider = user.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.provider = token.provider;
      }
      return session;
    },
  },
}
```

### Environment Variables for OAuth

Add these to your `.env.local` file:

```env
# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Facebook OAuth
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
```

### OAuth Provider Setup

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

#### GitHub OAuth Setup
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret

#### Facebook OAuth Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app → Consumer
3. Add Facebook Login product
4. Set Valid OAuth Redirect URIs: `http://localhost:3000/api/auth/callback/facebook`
5. Copy App ID and App Secret

## Key Features Implemented

- NextAuth v5 integration with OAuth and credentials authentication
- Role-based access control (tenant/manager)
- Property management with location/geocoding (image URLs handled by frontend)
- Application workflow (create, approve/deny)
- Tenant favorites system
- Lease and payment tracking
- Comprehensive filtering for property search
- PostGIS integration for location-based queries