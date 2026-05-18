# React Login Page

This project is a React 19 + Vite 8 auth UI built with Tailwind CSS, Storybook 10, TypeScript, and a minimal Express + PostgreSQL backend scaffold.

## Scripts

- `npm start` or `npm run dev`: start the Vite dev server
- `npm run build`: build the application for production
- `npm run db:check`: verify the backend can connect to PostgreSQL using your current `.env`
- `npm run db:migrate`: apply `database/001_users.sql` to the connected PostgreSQL database
- `npm run typecheck`: run the TypeScript compiler with no emit
- `npm run lint`: run ESLint across the repo
- `npm run server:dev`: start the backend API in watch mode
- `npm run server:build`: compile the backend into `server/dist`
- `npm run server:start`: run the compiled backend
- `npm run storybook`: start Storybook locally
- `npm run build-storybook`: build the Storybook static site

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Storybook 10
- Vitest
- Express 5
- PostgreSQL

## Project Notes

- Application entrypoint: `src/main.tsx`
- Backend entrypoint: `server/src/index.ts`
- SQL migrations live in `database/`
- Storybook config lives in `.storybook/`
- Shared UI examples live in `src/components/`
- Shared auth payload types live in `shared/`

## Backend Setup

1. Copy `.env.example` to `.env`.
2. Prefer the separate `DATABASE_HOST` / `DATABASE_NAME` / `DATABASE_USER` / `DATABASE_PASSWORD` fields for live credentials, especially if the password contains special URL characters.
3. If you already have a provider-issued connection string, you can still use `DATABASE_URL` instead. `DATABASE_URL` now accepts either a standard `postgresql://...` URL or a libpq `host=... port=... dbname=... user=... password=...` string.
4. Leave `DATABASE_SSL=true` for hosted providers unless you know your instance accepts plain TCP.
5. If your provider uses a trusted certificate, keep `DATABASE_SSL_REJECT_UNAUTHORIZED=true`; if you are testing against a self-signed certificate, set it to `false` temporarily.
6. If any `.env` value contains `#`, spaces, or trailing punctuation that should be preserved, wrap that whole value in quotes. Example: `DATABASE_PASSWORD="your#password"`.
7. Run `npm run db:check` to verify connectivity before starting the API.
8. Run `npm run db:migrate` to apply the auth schema.
9. Start the API with `npm run server:dev`.
10. Start the frontend with `npm start`.

## Validation

Use this sequence after structural changes:

1. `npm run typecheck`
2. `npm run build`
3. `npm run build-storybook`
4. `npm run lint`
