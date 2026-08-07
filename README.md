# Recnuvia Pro — cross-border transfer prototype

A prototype fintech app: individuals and businesses hold a balance, send money
to each other (with currency conversion), deposit, and withdraw — but **every
transaction sits in a pending queue until an admin approves or declines it**.
Nothing here moves real money. Accounts and transactions are stored in a real
PostgreSQL database, so they persist across restarts and deploys.

## Stack
- **Backend**: Node + Express, JWT auth, PostgreSQL (via the `pg` driver)
- **Frontend**: React + Vite + Tailwind, talking to the backend over a REST API

## Running it locally

You'll need [Node.js](https://nodejs.org) 18+ and a PostgreSQL database —
the easiest free option is [Neon](https://neon.tech) (permanent free tier,
no credit card). Create a project there and copy its connection string.

**1. Backend**
```bash
cd backend
npm install
export DATABASE_URL="postgres://...your Neon connection string..."
npm run dev
```
This starts the API at `http://localhost:4000`, automatically creates the
tables on first run, seeds the demo accounts if the database is empty, and
prints the demo login credentials.

**2. Frontend** (in a second terminal)
```bash
cd frontend
npm install
npm run dev
```
This starts the app at `http://localhost:5173`. Vite proxies `/api` requests
to the backend automatically.

## Demo accounts

| Email | Password | Role |
|---|---|---|
| admin@recnuviapro.demo | admin123 | admin (control desk) |
| sarah@recnuviapro.demo | password123 | individual, USD |
| tunde@recnuviapro.demo | password123 | individual, USD |
| biz@recnuviapro.demo | password123 | business, USD |

Log in as `sarah` or `tunde`, send some money, then log in as `admin` in
another browser (or incognito window) to approve or decline it and watch the
balances update.

## What's actually implemented
- Register/login as an individual or business, with roles
- Deposit, withdraw, and send money (domestic or cross-currency, using
  fixed mock exchange rates)
- Every transaction is created as `pending` and has **zero effect on
  balances** until an admin decides
- Admin control desk: a review queue, an approve/decline action per
  transaction, a full ledger, and an accounts list
- JWT-based auth and role-based route protection on the backend
- Data lives in a real PostgreSQL database and survives restarts and redeploys

## What this is *not*
This is a UI/logic prototype, not a production payment system. To actually
move real money internationally you'd need to integrate a licensed payment
processor or banking-as-a-service provider (e.g. Wise Platform, Stripe
Treasury, a local PSP) and hold the relevant money-transmitter licenses in
each jurisdiction you operate in — that's a legal/compliance layer, not
something any codebase can substitute for. This project is meant as a
foundation you could later wire up to that kind of provider.

## Where to go next
- Add KYC fields and document upload for onboarding
- Add pagination and filtering to the admin ledger
- Add email/SMS notifications when a transaction is decided
- Add audit logging for every admin decision (who, when, why)
