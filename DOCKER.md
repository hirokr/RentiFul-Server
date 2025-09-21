# Dockerize NestJS Project

## Build Docker Image

```
docker build -t rentiful-server .
```

## Run with Docker Compose

```
docker-compose up --build
```

## Environment Variables

- Place your environment variables in a `.env` file (not included in the image by default).

## Notes

- The app listens on port 3000 by default. Adjust the `EXPOSE` and `ports` in Dockerfile/docker-compose.yml if needed.
- For production, ensure your database and other services are accessible from the container.
