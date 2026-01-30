# Database Setup Guide

## Option 1: Using Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed

### Quick Start
```bash
# Start PostgreSQL database
npm run db:start

# Setup database schema
npm run db:setup

# Start the application
npm run dev

# Optional: Access database admin panel
npm run db:admin
# Visit http://localhost:8080
# Server: postgres, Username: postgres, Password: password, Database: ai_counsellor
```

### Stop Database
```bash
npm run db:stop
```

## Option 2: Local PostgreSQL Installation

### Prerequisites
- PostgreSQL 12+ installed locally

### Setup Steps
1. Create database:
```sql
CREATE DATABASE ai_counsellor;
```

2. Update `.env` file in backend folder:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_counsellor
DB_USER=your_username
DB_PASSWORD=your_password
```

3. Run setup:
```bash
cd backend
npm run db:setup
```

## Database Schema

The database includes:
- **users** - User authentication and profile info
- **profiles** - Onboarding data (academic background, goals, budget)
- **universities** - University data with categories (dream/target/safe)
- **shortlists** - User university shortlists and locks
- **tasks** - Application tasks and to-dos

## Sample Data

The setup includes 8 sample universities:
- **Dream**: Stanford, MIT
- **Target**: University of Toronto, Edinburgh, Melbourne
- **Safe**: Arizona State, University of Ottawa, Griffith

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL is running
- Check credentials in `.env` file
- Verify database exists

### Permission Issues
- Ensure user has CREATE/DROP privileges
- Check PostgreSQL user permissions

### Docker Issues
- Ensure Docker is running
- Check port 5432 is not in use
- Run `docker-compose logs postgres` for logs