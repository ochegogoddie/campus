# Campus Gigs

Campus Gigs is a Next.js application for posting gigs, finding collaborators, managing project teams, and messaging inside a campus community.

## Tech Stack

- Next.js 16 with the App Router
- NextAuth credentials authentication
- Prisma with PostgreSQL
- Cloudinary file uploads
- Tailwind CSS

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Keep all local environment variables in `.env.gigs` only:

   ```env
   DATABASE_URL=
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

   The built-in admin account is provisioned automatically by the server and does not require an environment variable.
   The app scripts load `.env.gigs` automatically for local development and Prisma commands.

3. Generate the Prisma client and sync the schema:

   ```bash
   npm run db:generate
   npm run db:push
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

## Render Deployment Notes

- This repo now includes a [render.yaml](./render.yaml) Blueprint for a Node web service plus a Render PostgreSQL database.
- The web service runs Prisma migrations with `npm run db:migrate:deploy` before each deploy instead of using `db push` during build.
- `NEXTAUTH_URL` falls back to Render's built-in `RENDER_EXTERNAL_URL`, so the first deploy works without manually setting that variable.
- If you later attach a custom domain, set `NEXTAUTH_URL` in Render to that custom HTTPS URL.
- Cloudinary variables remain optional for deployment, but uploads return a clear `503` response until `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are configured.
- Use `GET /api/health` as the health check endpoint. It validates required env vars and database connectivity.

## Available Scripts

- `npm run dev` starts the local Next.js dev server.
- `npm run build` creates the production build.
- `npm run start` starts the production server.
- `npm run lint` runs ESLint.
- `npm run db:push` syncs the Prisma schema to the configured database.
- `npm run db:migrate:deploy` applies committed Prisma migrations for production deploys.
- `npm run db:generate` regenerates the Prisma client after schema changes.
- `npm run db:studio` opens Prisma Studio.
- `npm run db:reset` force-resets the configured database schema.
- `npm run db:test` checks that Prisma can connect and query the database.
