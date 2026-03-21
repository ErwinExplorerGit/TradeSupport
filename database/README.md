# TradeDB PostgreSQL Database

This folder contains the Docker setup for the TradeSupport PostgreSQL database.

## Prerequisites

- Docker installed on your system
- Docker Compose installed (usually included with Docker Desktop)

## Database Configuration

- **Database Name:** tradedb
- **User:** postgres
- **Password:** postgres
- **Port:** 5432
- **Host:** localhost

## pgAdmin Configuration

- **URL:** http://localhost:5050
- **Email:** admin@admin.com
- **Password:** admin

## Quick Start

### 1. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

You can customize the database credentials and ports in the `.env` file if needed.

### 2. Start the Database

Navigate to the database folder and run:

```bash
cd database
docker-compose up -d
```

The `-d` flag runs the container in detached mode (background).

### 3. Verify the Database is Running

Check the container status:

```bash
docker-compose ps
```

You should see both the `tradedb` and `pgadmin` containers running.

### 3. Access pgAdmin

Open your browser and navigate to:

```
http://localhost:5050
```

Login with:
- **Email:** admin@admin.com
- **Password:** admin

#### Add Database Server in pgAdmin

1. Click "Add New Server"
2. In the "General" tab, enter a name (e.g., "TradeDB")
3. In the "Connection" tab, enter:
   - **Host name/address:** `postgres` ⚠️ **Important: Use `postgres`, NOT `localhost`**
   - **Port:** `5432`
   - **Maintenance database:** `tradedb`
   - **Username:** `postgres`
   - **Password:** `postgres`
4. Click "Save"

**Why use `postgres` as the host?**  
Both pgAdmin and PostgreSQL are running in Docker containers. The hostname `postgres` is the service name from docker-compose.yml, which allows containers in the same network to communicate. Using `localhost` or `127.0.0.1` won't work because that refers to the pgAdmin container itself, not the PostgreSQL container.

### 4. View Database Logs

```bash
docker-compose logs -f postgres
```

Press `Ctrl+C` to exit the logs view.

## Common Commands

### Stop the Database

```bash
docker-compose down
```

### Stop and Remove All Data

```bash
docker-compose down -v
```

**Warning:** This will delete all data in the database!

### Restart the Database

```bash
docker-compose restart
```

### Connect to the Database

Using `psql` from within the container:

```bash
docker exec -it tradedb psql -U postgres -d tradedb
```

**From pgAdmin (running in Docker):**

Use service name as host:
```
Host: postgres
Port: 5432
Database: tradedb
Username: postgres
Password: postgres
```

**From external tools on your host machine** (e.g., DBeaver, TablePlus, or local psql):

Use localhost as host:
```
Host: localhost
Port: 5432 (or the value you set in POSTGRES_PORT)
Database: tradedb (or the value you set in POSTGRES_DB)
Username: postgres (or the value you set in POSTGRES_USER)
Password: postgres (or the value you set in POSTGRES_PASSWORD)
```

**Note:** These values can be customized in your `.env` file.

## Running SQL Scripts

### Execute schema.sql (Create Database Tables)

**Method 1: Using docker exec (Recommended)**

```bash
cd database
docker exec -i tradedb psql -U postgres -d tradedb < schema.sql
```

**Method 2: Copy file into container**

```bash
cd database
docker cp schema.sql tradedb:/tmp/schema.sql
docker exec -it tradedb psql -U postgres -d tradedb -f /tmp/schema.sql
```

**Method 3: Using pgAdmin**

1. Go to http://localhost:5050
2. Connect to your TradeDB server
3. Right-click on the `tradedb` database → **Query Tool**
4. Click **File** → **Open** → Select your SQL file
5. Click the **Execute** button (▶️)

**Method 4: Using psql from host machine** (if psql is installed locally)

```bash
cd database
psql -h localhost -p 5432 -U postgres -d tradedb -f schema.sql
```

## Troubleshooting

### Port Already in Use

If port 5432 is already in use, you can modify the port in your `.env` file:

```
POSTGRES_PORT=5433  # Change to any available port
```

Then restart the containers:

```bash
docker-compose down && docker-compose up -d
```

### Check Container Health

```bash
docker inspect tradedb | grep -A 10 Health
```

### Reset the Database

To completely reset the database and start fresh:

```bash
docker-compose down -v
docker-compose up -d
```

## Data Persistence

Database data is persisted in a Docker volume named `postgres_data`. This ensures your data survives container restarts.

To view all volumes:

```bash
docker volume ls
```

## Environment Variables

The database configuration is managed through the `.env` file. To customize settings:

1. Copy `.env.example` to `.env` (if not done already):
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file to change ports, passwords, or other settings:
   ```
   POSTGRES_DB=tradedb
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_secure_password
   POSTGRES_PORT=5432
   
   PGADMIN_DEFAULT_EMAIL=your_email@example.com
   PGADMIN_DEFAULT_PASSWORD=your_secure_password
   PGADMIN_PORT=5050
   ```

3. Restart the containers to apply changes:
   ```bash
   docker-compose down && docker-compose up -d
   ```

**Note:** The `.env` file is excluded from version control for security. Never commit your `.env` file.
