# AI Article Generator

A full-stack application leveraging AI to generate articles, featuring a robust Next.js frontend and a Nest.js backend with automated background workers.

## Quick Start (Docker Compose)

The easiest way to get the entire application (Frontend, Backend API, AI Worker, Postgres, and Redis) running locally is using Docker Compose.

### 1. Configure Environment Variables
Make sure you have your `.env` files set up. You will need:
- `backend/.env` (Contains Database URLs, Gemini API keys, etc.)
- `frontend/.env.local` (If required for frontend-specific secrets)

### 2. Start the Application
Run the following command in the root directory to build and start all containers in the background:

```bash
docker-compose up -d --build
```

This will spin up:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **AI Worker**: Runs automatically in the background to process queues
- **PostgreSQL Database**: Port `5432`
- **Redis Cache**: Port `6379`

### 3. Run Database Migrations
Once the database container is up and running, you need to apply the Prisma database migrations to create the tables.

You can run the migrations from your host machine (requires Node.js installed locally):

```bash
cd backend
npm install
npm run db:migrate
```

*Alternatively, if you don't have Node installed locally, you can run the migration directly inside the API container:*
```bash
docker exec -it travel_ai_api npx prisma migrate dev
```

### 4. Stopping the Application
To stop all containers and remove them (without deleting your database data):
```bash
docker-compose down
```

To stop containers AND wipe all database data (volumes):
```bash
docker-compose down -v
```

---

## Production Deployment
For EC2/Production environments with limited memory, we recommend pre-building your Docker images, pushing them to Docker Hub, and using `docker-compose.prod.yml` alongside an Nginx reverse proxy to serve traffic efficiently.
