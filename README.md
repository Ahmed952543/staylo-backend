# Staylo Backend

REST API for Staylo, an Airbnb-style booking app. Built **database-first**
with PostgreSQL and NestJS (TypeORM, JWT auth, class-validator).

## Requirements
- Node.js 20+
- PostgreSQL 16+

## Setup
1. Install packages:
```bash
   npm install
```
2. Create a database named `staylo_db` (pgAdmin → Databases → Create).
3. In the Query Tool on `staylo_db`, run `database/schema.sql`, then `database/seed.sql`.
4. Copy `.env.example` to `.env` and fill in your Postgres password and port.
   Generate a JWT secret with:
```bash
   openssl rand -hex 32
```
5. Start the server:
```bash
   npm run start:dev
```
   The API runs on http://localhost:3000. Try http://localhost:3000/listings

## Notes
- `synchronize` is `false`: TypeORM never changes the tables. Schema changes go in SQL first.
- The seed users have placeholder passwords and can't log in. Register a new user with `POST /auth/register`.

## Modules
users · auth · listings (+ amenities) · bookings · reviews