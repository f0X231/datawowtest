# Concert Reservation System

Full-stack concert ticket reservation app using Next.js (frontend) and NestJS (backend).

## Project Structure

```
datawowtest/
├── frontend/          # Next.js 16 — App Router
│   └── src/
│       ├── app/       # Pages: admin portal, user portal, auth
│       └── lib/       # axios client + auth helpers
├── backend/           # NestJS 11 — REST API
│   └── src/
│       ├── auth/      # JWT, guards, strategies
│       ├── users/
│       ├── concerts/
│       ├── reservations/
│       ├── migrations/
│       └── config/
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## Prerequisites

- Docker & Docker Compose v2+
- Node.js 22+ (for local dev only)

## Running with Docker

```bash
cp .env.example .env
docker compose up --build
# API → http://localhost:3000/api
```

The migration runs automatically on startup — no extra step needed.

## Local Development

```bash
npm install

# Start only the database
docker compose up db -d

# Backend
npm run dev:backend        # http://localhost:3000/api

# Frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > frontend/.env.local
npm run dev:frontend       # http://localhost:4200
```

## Running Tests

```bash
node node_modules/.bin/jest --config backend/jest.config.ts --no-coverage --forceExit
```

Tests cover `ConcertsService` (create, delete, seat calculation, fully-booked, userReserved) and `ReservationsService` (reserve, cancel, history) including edge cases like overbooking and re-reservation after cancel.

## API Endpoints

| Method | Path | Role |
|---|---|---|
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| GET | `/api/concerts` | admin, user |
| GET | `/api/concerts/stats` | admin |
| POST | `/api/concerts` | admin |
| DELETE | `/api/concerts/:id` | admin |
| GET | `/api/reservations/history` | admin |
| POST | `/api/reservations/reserve/:id` | user |
| POST | `/api/reservations/cancel/:id` | user |
| GET | `/api/reservations/history/me` | user |

## Libraries

**Backend:** `@nestjs/common`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/typeorm`, `typeorm`, `pg`, `passport-jwt`, `bcrypt`, `class-validator`, `class-transformer`

**Frontend:** `next`, `react`, `axios`

**Testing:** `jest`, `ts-jest`, `@nestjs/testing`

---

## Bonus

### Performance Optimization

For large datasets and high traffic:

- **Indexes** on `reservations(user_id)` and `reservations(concert_id)` to speed up seat calculation queries.
- **Redis cache** for concert listings and stats (short TTL, invalidated on write). Most reads are the same data repeated at high volume.
- **Read replica** for all GET endpoints so queries don't compete with writes on the primary DB.
- **Pagination** on concert listing and history endpoints instead of returning full tables.
- **CDN** (e.g. Vercel Edge / Cloudflare) for frontend static assets.

### Concurrency Control

1,000 users hitting reserve at the same millisecond can cause a race condition — all read "seats available" before any write completes, leading to overbooking.

The fix is **pessimistic locking** inside a database transaction:

```typescript
await dataSource.transaction(async (manager) => {
  const concert = await manager
    .createQueryBuilder(Concert, 'concert')
    .where('concert.id = :id', { id: concertId })
    .setLock('pessimistic_write')  // SELECT ... FOR UPDATE
    .getOne();

  const activeCount = calculateActive(concert.reservations);
  if (activeCount >= concert.totalSeats) {
    throw new BadRequestException('No seats available');
  }

  await manager.save(Reservation, { userId, concertId, action: 'reserve' });
});
```

`SELECT FOR UPDATE` locks the concert row for the duration of the transaction. Concurrent requests queue behind it and will correctly see 0 seats once the lock is released.

**Alternatives:**
- *Optimistic locking* — add a `version` column; conflicts trigger a retry. Works well under low contention but can retry-storm under high concurrency.
- *Message queue* (Bull/Redis) — serialize all reservation requests into a FIFO queue per concert. Eliminates races entirely but adds latency and infrastructure overhead.
