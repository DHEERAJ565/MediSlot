# MediSlot — Next.js migration

The frontend is now bootstrapped with the **Next.js App Router**. The existing React screens, styles, API client, authentication context, and Express/MongoDB backend have been retained to avoid losing working features during the framework migration.

## Project structure

- `client/app/` — Next.js App Router entry point and root layout.
- `client/src/` — Existing React screens, reusable components, contexts, hooks, store, and styles.
- `client/public/videos/` — Existing public video assets.
- `server/` — Existing Express API, MongoDB models, routes, controllers, services, and seed data.

## Run locally

1. Install Node.js 20 or newer.
2. Copy `server/.env.example` to `server/.env` and set `MONGO_URI`, `JWT_SECRET`, and other values.
3. Copy `client/.env.example` to `client/.env.local`.
4. From the repository root run `npm run install:all`.
5. Start the API in one terminal: `npm run server`.
6. Start Next.js in another terminal: `npm run client`.
7. Open `http://localhost:3000`.

For a production frontend build, run `npm run build`, then `npm run start:client`.

## Important migration note

This is a compatibility-first Next.js App Router migration: Next.js owns the application entry point and route fallback, while the existing React Router route tree remains active inside the client-only application shell. This deliberately preserves every existing route and browser-storage-dependent workflow in the first migration pass. It is not yet a full native Next.js routing rewrite; converting every `Link`, `useNavigate`, `useParams`, nested layout, and protected route to native Next.js APIs should be done as a separate verified pass so authentication and appointment flows are not broken.

The backend remains a separate Express service. It is not moved into Next.js route handlers.
