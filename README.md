# Socket IO Local Setup

## 1. Create env file

Copy `.env.example` to `.env` and update the API keys if needed.

## 2. Start Postgres with Docker

```bash
npm run db:up
```

This starts a local PostgreSQL service on `localhost:5432` with:

- database: `chatdb`
- username: `postgres`
- password: `123456`

## 3. Apply Prisma migrations

```bash
npm run db:migrate
```

Or run both steps in one command:

```bash
npm run db:setup
```

## 4. Run the app

```bash
npm run dev
```

## 5. Stop Docker services

```bash
npm run db:down
```
