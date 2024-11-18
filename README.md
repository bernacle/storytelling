# Project Setup Instructions

This guide will help you set up and run the project, including both the database and worker services.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed and running.
- Node.js installed on your machine.

## Getting Started

### Step 1: Run the Docker Containers

First, you need to start the necessary services using Docker Compose. The setup includes PostgreSQL and Redis containers.

```sh
docker-compose up -d
```

### Step2: Run migrations

```sh
pnpm db:migrate
```


### Step 3: Start the API Server and Workers

Next, you need to start the API server and worker processes.

To do this, use the following commands:

Start the API server:

   ```sh
   pnpm dev
   ```
   
   This command runs `tsx watch src/server.ts` to start the API server in development mode.

Start the worker process:

   ```sh
   pnpm worker
   ```

   This command runs `tsx watch src/workers/index.ts` to start the worker service in development mode.

### Note

**Both the API server and the worker process need to be running concurrently** for the system to function properly.

## Troubleshooting

- Make sure Docker is installed and running.
- Ensure the required ports (5432 for PostgreSQL, 6379 for Redis) are not in use by other applications.
