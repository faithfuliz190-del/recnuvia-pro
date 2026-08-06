# Recnuvia Pro — cross-border transfer prototype

A prototype fintech app: individuals and businesses hold a balance, send money
to each other (with currency conversion), deposit, and withdraw — but **every
transaction sits in a pending queue until an admin approves or declines it**.
Nothing here moves real money; balances are in-memory mock data that resets
whenever the backend restarts.

## Stack
- **Backend**: Node + Express, JWT auth, in-memory data store (no database
  needed to try it out)
- **Frontend**: React + Vite + Tailwind, talking to the backend over a REST API

## Running it locally

You'll need [Node.js](https://nodejs.org) 18+ installed.

**1. Backend**
```bash
cd backend
npm install
npm run dev
```
This starts the API at `http://localhost:4000` and prints demo login credentials.

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
| tunde@recnuviapro.demo | password123 | individual, NGN |
| biz@recnuviapro.demo | password123 | business, NGN |

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

## What this is *not*
This is a UI/logic prototype, not a production payment system. To actually
move real money internationally you'd need to integrate a licensed payment
processor or banking-as-a-service provider (e.g. Wise Platform, Stripe
Treasury, a local PSP) and hold the relevant money-transmitter licenses in
each jurisdiction you operate in — that's a legal/compliance layer, not
something any codebase can substitute for. This project is meant as a
foundation you could later wire up to that kind of provider.

## Where to go next
- Swap the in-memory store for a real database (Postgres + an ORM like
  Prisma is a common choice)
- Add KYC fields and document upload for onboarding
- Add pagination and filtering to the admin ledger
- Add email/SMS notifications when a transaction is decided
- Add audit logging for every admin decision (who, when, why)
