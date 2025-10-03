## Docker Setup for NestJS API

This application is containerized to work with a cloud PostgreSQL database (e.g., Neon, Supabase, Railway).

### Prerequisites

1. **Cloud PostgreSQL Database**: Make sure you have a cloud PostgreSQL database URL
2. **Environment Variables**: Copy `.env.example` to `.env` and update with your values

### Building and running your application

1. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your actual database URL and other credentials
   ```

2. **Start the application**:

   ```bash
   docker compose up --build
   ```

   Your application will be available at http://localhost:3001.

3. **Check health status**:
   ```bash
   curl http://localhost:3001/health
   ```

### Environment Variables

Required environment variables:

- `DATABASE_URL`: Your cloud PostgreSQL connection string
- `SHADOW_DATABASE_URL`: Shadow database URL for Prisma migrations
- `JWT_SECRET`: Secret key for JWT tokens
- `AUTH_SECRET`: Secret key for authentication

Optional OAuth variables:

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

### Database Migrations

The container automatically runs Prisma migrations on startup. Make sure your database is accessible from the Docker container.

### Deploying to the cloud

1. **Build for production**:

   ```bash
   docker build -t homex-api .
   ```

2. **For different CPU architecture** (e.g., Mac M1 to AMD64):

   ```bash
   docker build --platform=linux/amd64 -t homex-api .
   ```

3. **Push to registry**:
   ```bash
   docker tag homex-api your-registry.com/homex-api
   docker push your-registry.com/homex-api
   ```

### Troubleshooting

- **Database connection issues**: Check your `DATABASE_URL` and ensure the database is accessible
- **Migration failures**: Ensure your shadow database URL is correct
- **Port conflicts**: The app runs on port 3001 by default

### References

- [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)
