# Kejsan website revamp

## Authentication setup

This project uses Supabase email/password authentication for the admin section. Configure the following environment variables:

- `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` – the Supabase project URL (set both to expose the value to the browser).
- `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` – your Supabase anon key (again, set both for browser access).
- `ADMIN_EMAILS` – comma separated list of Supabase user emails allowed to access `/admin` and related API routes.
- `NEXT_PUBLIC_ADMIN_EMAIL` (optional) – used to map the `kejsan` username on the login form to a specific email address.

The admin dashboard lives at `/admin` and now signs in through `/admin/login`. After a successful Supabase login the app stores a secure, HttpOnly cookie so server actions can continue to enforce admin-only access.

> [!IMPORTANT]
> For a detailed guide on setting up the environment variables and ensuring your Supabase user is configured correctly for admin access, please see the [Admin Section Setup Guide](./ADMIN_GUIDE.md).

## Database migrations

Netlify builds run with the `NETLIFY=true` environment variable, so the automated build pipeline skips `prisma migrate deploy`. Apply migrations from CI or manually before triggering a Netlify deploy to ensure the production database schema matches the application.
