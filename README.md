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

2. Configure the required environment variables in `.env.gigs` locally and in Render:

   ```env
   DATABASE_URL=
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

   The built-in admin account is provisioned automatically by the server and does not require an environment variable.

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

- Use a PostgreSQL database on Render and paste its connection string into `DATABASE_URL`.
- Set `NEXTAUTH_URL` to your Render service URL, for example `https://<your-render-service>.onrender.com`.
- Copy the values from `.env.gigs` into the Render environment settings before the first deploy.

## Available Scripts

- `npm run dev` starts the local Next.js dev server.
- `npm run build` generates the Prisma client, syncs the schema, and builds the app.
- `npm run start` starts the production server.
- `npm run lint` runs ESLint.
- `npm run db:push` syncs the Prisma schema to the configured database.
- `npm run db:generate` regenerates the Prisma client.
- `npm run db:studio` opens Prisma Studio.
- `npm run db:reset` force-resets the configured database schema.
- `npm run db:test` checks that Prisma can connect and query the database.
