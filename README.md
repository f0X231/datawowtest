# Concert Reservation System

ระบบจองบัตรคอนเสิร์ต สร้างด้วย Next.js (frontend) และ NestJS (backend) ใน NX monorepo

## โครงสร้างโปรเจค

```
datawowtest/
├── frontend/          # Next.js 16 — App Router
│   └── src/
│       ├── app/       # หน้าต่างๆ: admin portal, user portal, auth
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

## สิ่งที่ต้องมีก่อนรัน

- Docker & Docker Compose v2+
- Node.js 22+ (สำหรับรันบนเครื่องโดยตรง)

## รันด้วย Docker

```bash
cp .env.example .env
docker compose up --build
# API → http://localhost:3000/api
```

Migration จะรันอัตโนมัติตอน backend เริ่ม ไม่ต้องรันเพิ่ม

## รันบนเครื่องโดยตรง

```bash
npm install

# เริ่ม database อย่างเดียวก่อน
docker compose up db -d

# Backend
npm run dev:backend        # http://localhost:3000/api

# Frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > frontend/.env.local
npm run dev:frontend       # http://localhost:4200
```

## รัน Tests

```bash
node node_modules/.bin/jest --config backend/jest.config.ts --no-coverage --forceExit
```

ครอบคลุม `ConcertsService` และ `ReservationsService` รวม edge cases เช่น overbooking และการจองซ้ำหลังจาก cancel

## API Endpoints

| Method | Path | สิทธิ์ |
|---|---|---|
| POST | `/api/auth/register` | สาธารณะ |
| POST | `/api/auth/login` | สาธารณะ |
| GET | `/api/concerts` | admin, user |
| GET | `/api/concerts/stats` | admin |
| POST | `/api/concerts` | admin |
| DELETE | `/api/concerts/:id` | admin |
| GET | `/api/reservations/history` | admin |
| POST | `/api/reservations/reserve/:id` | user |
| POST | `/api/reservations/cancel/:id` | user |
| GET | `/api/reservations/history/me` | user |

## Libraries ที่ใช้

**Backend:** `@nestjs/common`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/typeorm`, `typeorm`, `pg`, `passport-jwt`, `bcrypt`, `class-validator`, `class-transformer`

**Frontend:** `next`, `react`, `axios`

**Testing:** `jest`, `ts-jest`, `@nestjs/testing`

---

## Bonus

### Performance Optimization

สำหรับระบบที่มีข้อมูลเยอะและ traffic สูง:

- เพิ่ม **Index** บน `reservations(user_id)` และ `reservations(concert_id)` เพื่อเร่งการคำนวณที่นั่ง
- ใช้ **Redis cache** สำหรับ concert listing และ stats โดยกำหนด TTL สั้น และ invalidate เมื่อมีการเขียนข้อมูล
- แยก **Read replica** สำหรับ GET endpoints ทั้งหมด เพื่อไม่ให้ query ไปแย่ง resource กับฝั่ง write
- เพิ่ม **Pagination** บน endpoint ที่ return list แทนการดึงข้อมูลทั้งหมดในครั้งเดียว
- ใช้ **CDN** สำหรับ static assets ของ frontend

### Concurrency Control

ถ้ามีผู้ใช้ 1,000 คนกด reserve พร้อมกัน อาจเกิด race condition ได้ เพราะทุกคน read ว่า "ยังมีที่นั่ง" ก่อนที่ใครจะ write เสร็จ ทำให้ที่นั่งเกิน

วิธีแก้คือใช้ **pessimistic locking** ภายใน transaction:

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

`SELECT FOR UPDATE` จะ lock row นั้นไว้ตลอด transaction ทำให้ request ที่เข้ามาพร้อมกันต้องรอคิว และจะเห็นสถานะที่นั่งที่ถูกต้องหลัง lock ถูกปล่อย

**ทางเลือกอื่น:**
- *Optimistic locking* — เพิ่ม column `version` แล้ว retry เมื่อเกิด conflict เหมาะกับระบบที่ contention ต่ำ แต่ถ้า traffic สูงมากอาจเกิด retry storm
- *Message queue* (Bull/Redis) — รับ request ทุกอันเข้า queue แล้วประมวลผลทีละตัวต่อ concert ป้องกัน race ได้ 100% แต่เพิ่ม latency และ infrastructure
